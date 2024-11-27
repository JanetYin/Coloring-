import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GameStage from './GameStage';
import PuzzleModal from './PuzzleModal';
import HelperNoteModal from './NoteModal';
import { MapData, InteractiveTile, HelperPoint, HelperNote, GameProgress, SavedGameState } from '@/types';
import { defaultColors } from '@/components/shared/ColorPalette';
import WinModal from './WinModal';

interface GameSessionProps {
  mapId: string | number;
  mapData?: MapData;
}

const GameSession: React.FC<GameSessionProps> = ({ mapId, mapData }) => {
  const [currentMapData, setCurrentMapData] = useState<MapData | null>(null);
  const [activePuzzle, setActivePuzzle] = useState<InteractiveTile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWinModal, setShowWinModal] = useState(false);
  const [solvedPuzzles, setSolvedPuzzles] = useState<Set<string>>(new Set());
  const [isVictory, setIsVictory] = useState(false);
  const [isExplorationMode, setIsExplorationMode] = useState(false);

  const [currentMode, setCurrentMode] = useState<'player' | 'draw' | 'helper'>('player');
  const [helperPoints, setHelperPoints] = useState<HelperPoint[]>([]);
  const [showHelpers, setShowHelpers] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedHelperPoint, setSelectedHelperPoint] = useState<HelperPoint | null>(null);

  const [solvedAreas, setSolvedAreas] = useState<Set<string>>(new Set());
  const [recoveredCells, setRecoveredCells] = useState<Set<string>>(new Set());
  
  // New state for drawing tools
  const [selectedColor, setSelectedColor] = useState(defaultColors[0]);
  const [isEraser, setIsEraser] = useState(false);
  const [isPlacingPlayer, setIsPlacingPlayer] = useState(false);
  const [playerData, setPlayerData] = useState<(string | null)[][]>([]);
  const [lastPlayerPosition, setLastPlayerPosition] = useState<{rowIndex: number, colIndex: number} | null>(null);
  
  // Check if drawing is allowed
  const isDrawingAllowed = isVictory && isExplorationMode;

  const handleContinueExploring = () => {
    setIsExplorationMode(true);
    setCurrentMode('draw'); // Automatically switch to draw mode
  };

  const handleModeChange = (mode: 'player' | 'draw' | 'helper') => {
    if (mode === 'draw' && !isDrawingAllowed) {
      // Show a message that drawing is only available after victory
      alert('Drawing mode will be unlocked after solving all puzzles!');
      return;
    }
    setCurrentMode(mode);
  };

  

  useEffect(() => {
    // Load player data from localStorage
    try {
      const savedPlayerData = localStorage.getItem('player-sprite');
      if (savedPlayerData) {
        const parsed = JSON.parse(savedPlayerData);
        if (parsed.pixels && Array.isArray(parsed.pixels)) {
          setPlayerData(parsed.pixels);
        }
      }
    } catch (error) {
      console.error('Error loading player data:', error);
    }
  }, []);
  const removeLastPlayer = (mapData: MapData) => {
    if (!lastPlayerPosition) return mapData;

    const { rowIndex, colIndex } = lastPlayerPosition;
    const newMapData = { ...mapData };
    const playerHeight = playerData.length;
    const playerWidth = playerData[0].length;

    // Calculate the area where the last player was placed
    const startRow = rowIndex - Math.floor(playerHeight / 2);
    const startCol = colIndex - Math.floor(playerWidth / 2);

    // Clear the area
    for (let i = 0; i < playerHeight; i++) {
      for (let j = 0; j < playerWidth; j++) {
        const currentRow = startRow + i;
        const currentCol = startCol + j;
        if (currentRow >= 0 && currentRow < mapData.objectsLayer.length &&
            currentCol >= 0 && currentCol < mapData.objectsLayer[0].length) {
          newMapData.objectsLayer[currentRow][currentCol] = '';
        }
      }
    }

    return newMapData;
  };
  const exportToPNG = async () => {
    const gridContainer = document.querySelector('.game-grid-container') as HTMLElement;
    if (!gridContainer) return;
  
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(gridContainer);
      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = 'game-map.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting to PNG:', error);
      alert('Failed to export PNG');
    }
  };
  
  const exportToJSON = () => {
    if (!currentMapData || !mapData) return;
  
    const exportData = {
      mapData: {
        ...currentMapData,
        // Include original colors for reference
        originalBackgroundLayer: mapData.backgroundLayer,
        originalObjectsLayer: mapData.objectsLayer
      },
      helperPoints,
      gameProgress,
      playerPosition: lastPlayerPosition
    };
  
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game-state.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (!currentMapData || !playerData.length) return;
    
    let newMapData = { ...currentMapData };
    
    if (currentMode === 'player' && playerData.length > 0) {
      setIsPlacingPlayer(true); // Add this line
      // Remove the last player placement if it exists
      if (lastPlayerPosition) {
        newMapData = removeLastPlayer(newMapData);
      }
      // Calculate center offset
      const playerHeight = playerData.length;
      const playerWidth = playerData[0].length;
      const startRow = rowIndex - Math.floor(playerHeight / 2);
      const startCol = colIndex - Math.floor(playerWidth / 2);

      // Place player sprite centered on click position
      for (let i = 0; i < playerHeight; i++) {
        for (let j = 0; j < playerWidth; j++) {
          const currentRow = startRow + i;
          const currentCol = startCol + j;
          
          if (currentRow >= 0 && currentRow < newMapData.objectsLayer.length &&
              currentCol >= 0 && currentCol < newMapData.objectsLayer[0].length &&
              playerData[i][j] !== null) {
            newMapData.objectsLayer[currentRow][currentCol] = playerData[i][j] || '';
          }
        }
      }
      
      // Save the new player position
      setLastPlayerPosition({ rowIndex, colIndex });
      setIsPlacingPlayer(false);
    } else if (currentMode === 'helper') {
      // Check if there's already a helper point at this location
      const existingPoint = helperPoints.find(
        point => point.position.row === rowIndex && point.position.col === colIndex
      );
  
      if (existingPoint) {
        // If clicking an existing point while in helper mode, remove it
        setHelperPoints(points => points.filter(point => point.id !== existingPoint.id));
      } else {
        // Add new helper point
        const newHelperPoint: HelperPoint = {
          id: `helper_${Date.now()}`,
          position: { row: rowIndex, col: colIndex },
          color: selectedColor
        };
        setHelperPoints(prevPoints => [...prevPoints, newHelperPoint]);
        setSelectedHelperPoint(newHelperPoint);
        setShowNoteModal(true);
      }
    } else if (currentMode === 'draw') {
      // Drawing mode
      newMapData.objectsLayer[rowIndex][colIndex] = isEraser ? '' : selectedColor;
    }
    
    setCurrentMapData(newMapData);
  };
  const handleHelperPointClick = (point: HelperPoint) => {
    setSelectedHelperPoint(point);
    setShowNoteModal(true);
  };
  // Add a helper point right-click handler
  const handleHelperPointRightClick = (e: React.MouseEvent, point: HelperPoint) => {
    e.preventDefault();
    e.stopPropagation();
    setHelperPoints(points => points.filter(p => p.id !== point.id));
  };

  const handleNoteSubmit = (note: HelperNote) => {
    if (selectedHelperPoint) {
      setHelperPoints(points => points.map(point => 
        point.id === selectedHelperPoint.id
          ? { ...point, note }
          : point
      ));
    }
    setShowNoteModal(false);
    setSelectedHelperPoint(null);
  };

  const toggleHelperVisibility = () => {
    setShowHelpers(!showHelpers);
  };

  const checkWinCondition = (newMapData: MapData) => {
    if (!mapData) return;

    const allPuzzlesSolved = mapData.interactiveTiles.every(tile => 
      gameProgress.solvedPuzzles.has(tile.id)
    );

    if (allPuzzlesSolved) {
      setIsVictory(true);
      setShowWinModal(true);
    }
  };

  useEffect(() => {
    if (mapData) {
      // Ensure the map is in grayscale initially
      const grayscaleMap = convertToGrayscale(mapData);
      setCurrentMapData(grayscaleMap);
      setLoading(false);
    } else {
      setError('Map not found');
      setLoading(false);
    }
  }, [mapId, mapData]);

  const convertToGrayscale = (map: MapData): MapData => {
    const grayscaleBackground = map.backgroundLayer.map((row, rowIndex) =>
      row.map((color, colIndex) => {
        // Check if this position has an interactive tile
        const hasInteractiveTile = map.interactiveTiles.some(
          tile => tile.position.row === rowIndex && tile.position.col === colIndex
        );

        // Keep original color for interactive tiles, convert others to grayscale
        if (hasInteractiveTile) {
          return color;
        }

        if (!color || color === '') return color;
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        const grayHex = gray.toString(16).padStart(2, '0');
        return `#${grayHex}${grayHex}${grayHex}`;
      })
    );

    const grayscaleObjects = map.objectsLayer.map((row, rowIndex) =>
      row.map((color, colIndex) => {
        // Check if this position has an interactive tile
        const hasInteractiveTile = map.interactiveTiles.some(
          tile => tile.position.row === rowIndex && tile.position.col === colIndex
        );

        // Keep original color for interactive tiles, convert others to grayscale
        if (hasInteractiveTile) {
          return color;
        }

        if (!color || color === '') return color;
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        const grayHex = gray.toString(16).padStart(2, '0');
        return `#${grayHex}${grayHex}${grayHex}`;
      })
    );

    return {
      ...map,
      backgroundLayer: grayscaleBackground,
      objectsLayer: grayscaleObjects,
    };
  };

  const handlePuzzleTrigger = (tile: InteractiveTile) => {
    if (tile.puzzle) {
      setActivePuzzle(tile);
    }
  };

  const handlePuzzleSolve = () => {
    if (!activePuzzle?.recoveryArea || !currentMapData || !mapData) return;
  
    const { startRow, startCol, endRow, endCol } = activePuzzle.recoveryArea;
    const newMapData = { ...currentMapData };
  
    // Recover colors in the area
    for (let i = startRow; i <= endRow; i++) {
      for (let j = startCol; j <= endCol; j++) {
        if (i >= 0 && i < mapData.backgroundLayer.length && 
            j >= 0 && j < mapData.backgroundLayer[0].length) {
          newMapData.backgroundLayer[i][j] = mapData.backgroundLayer[i][j];
          newMapData.objectsLayer[i][j] = mapData.objectsLayer[i][j];
        }
      }
    }
  
    // Update progress
    const newSolvedPuzzles = new Set([...gameProgress.solvedPuzzles, activePuzzle.id]);
    setGameProgress(prev => ({
      ...prev,
      solvedPuzzles: newSolvedPuzzles,
      recoveredAreas: new Set([...prev.recoveredAreas, 
        ...Array.from({ length: endRow - startRow + 1 }, (_, i) => 
          Array.from({ length: endCol - startCol + 1 }, (_, j) => 
            `${startRow + i},${startCol + j}`
          )
        ).flat()
      ])
    }));
  
    setCurrentMapData(newMapData);
    setActivePuzzle(null);
  
    // Check win condition before closing modal
    if (mapData.interactiveTiles.every(tile => newSolvedPuzzles.has(tile.id))) {
      setIsVictory(true);
      setShowWinModal(true);
    }
  };

  const [gameProgress, setGameProgress] = useState<GameProgress>(() => {
    // Try to load saved progress
    const emptyProgress: GameProgress = {
      solvedPuzzles: new Set<string>(),
      recoveredAreas: new Set<string>(),
      solvedHiddenTests: {}
    };

    const savedProgress = localStorage.getItem(`game_progress_${mapId}`);
    if (!savedProgress) return emptyProgress;

    try {
      const parsed = JSON.parse(savedProgress) as {
        solvedPuzzles: string[];
        recoveredAreas: string[];
        solvedHiddenTests: Record<string, number[]>;
      };
  
      return {
        solvedPuzzles: new Set(parsed.solvedPuzzles || []),
        recoveredAreas: new Set(parsed.recoveredAreas || []),
        solvedHiddenTests: Object.fromEntries(
          Object.entries(parsed.solvedHiddenTests || {}).map(([key, value]) => 
            [key, new Set(value as number[])]
          )
        )
      };
    } catch (e) {
      console.error('Error loading game progress:', e);
      return emptyProgress;
    }
  });
  const saveGameState = () => {
    if (!currentMapData) return;
    
    const savedState: SavedGameState = {
      recoveredColors: {
        backgroundLayer: currentMapData.backgroundLayer,
        objectsLayer: currentMapData.objectsLayer
      },
      helperPoints,
      gameProgress: {
        solvedPuzzles: Array.from(gameProgress.solvedPuzzles),
        recoveredAreas: Array.from(gameProgress.recoveredAreas),
        solvedHiddenTests: Object.fromEntries(
          Object.entries(gameProgress.solvedHiddenTests)
            .map(([key, value]) => [key, Array.from(value)])
        )
      },
      lastPlayerPosition
    };
  
    localStorage.setItem(`game_state_${mapId}`, JSON.stringify(savedState));
  };
  
  const loadGameState = () => {
    const savedState = localStorage.getItem(`game_state_${mapId}`);
    if (!savedState || !mapData) return;
  
    try {
      const parsed = JSON.parse(savedState) as SavedGameState;
      
      setCurrentMapData({
        ...mapData,
        backgroundLayer: parsed.recoveredColors.backgroundLayer,
        objectsLayer: parsed.recoveredColors.objectsLayer
      });
      
      setHelperPoints(parsed.helperPoints);
      setGameProgress({
        solvedPuzzles: new Set(parsed.gameProgress.solvedPuzzles),
        recoveredAreas: new Set(parsed.gameProgress.recoveredAreas),
        solvedHiddenTests: Object.fromEntries(
          Object.entries(parsed.gameProgress.solvedHiddenTests)
            .map(([key, value]) => [key, new Set(value)])
        )
      });
      
      if (parsed.lastPlayerPosition) {
        setLastPlayerPosition(parsed.lastPlayerPosition);
      }
  
      setIsVictory(parsed.gameProgress.solvedPuzzles.length === mapData.interactiveTiles.length);
      setIsExplorationMode(parsed.gameProgress.solvedPuzzles.length === mapData.interactiveTiles.length);
    } catch (error) {
      console.error('Error loading game state:', error);
    }
  };
  
  // Add useEffect hooks
  useEffect(() => {
    loadGameState();
  }, [mapId, mapData]);
  
  useEffect(() => {
    saveGameState();
  }, [currentMapData, helperPoints, gameProgress, lastPlayerPosition]);

  useEffect(() => {
    if (mapId && gameProgress) {
      localStorage.setItem(`game_progress_${mapId}`, JSON.stringify({
        solvedPuzzles: Array.from(gameProgress.solvedPuzzles),
        recoveredAreas: Array.from(gameProgress.recoveredAreas),
        solvedHiddenTests: Object.fromEntries(
          Object.entries(gameProgress.solvedHiddenTests).map(([key, value]) => [key, Array.from(value)])
        )
      }));
    }
  }, [gameProgress, mapId]);

  if (loading) return <div className="min-h-screen bg-[#eee1c4] flex items-center justify-center">
    <p className="text-2xl font-pixel text-[#937b6a]">Loading map...</p>
  </div>;

  if (error || !currentMapData) return <div className="min-h-screen bg-[#eee1c4] flex items-center justify-center">
    <p className="text-2xl font-pixel text-[#937b6a]">{error || 'Map not found'}</p>
  </div>;

  return (
    <div className="min-h-screen bg-[#eee1c4]">
      <GameStage 
        mapData={currentMapData}
        onTriggerPuzzle={handlePuzzleTrigger}
        selectedColor={selectedColor}
        isEraser={isEraser}
        setSelectedColor={setSelectedColor}
        setIsEraser={setIsEraser}
        onCellClick={handleCellClick}
        isPlacingPlayer={isPlacingPlayer}
        setIsPlacingPlayer={setIsPlacingPlayer}
        helperPoints={helperPoints}
        showHelpers={showHelpers}
        isHelperMode={currentMode === 'helper'}
        currentMode={currentMode}
        setCurrentMode={handleModeChange}
        onHelperPointClick={handleHelperPointClick}
        toggleHelperVisibility={toggleHelperVisibility}
        onExportPNG={exportToPNG}
        onExportJSON={exportToJSON}
        isDrawingAllowed={isDrawingAllowed}
      />
      
      {activePuzzle?.puzzle && (
        <PuzzleModal
          puzzle={activePuzzle.puzzle}
          tileId={activePuzzle.id}
          progress={gameProgress.solvedHiddenTests[activePuzzle.id]}
          onClose={() => setActivePuzzle(null)}
          onSolve={handlePuzzleSolve}
          onUpdateProgress={(solvedTests: Set<number>) => {
            setGameProgress(prev => ({
              ...prev,
              solvedHiddenTests: {
                ...prev.solvedHiddenTests,
                [activePuzzle.id]: solvedTests
              }
            }));
          }}
        />
      )}

      {showNoteModal && (
        <HelperNoteModal
          initialNote={selectedHelperPoint?.note}
          onClose={() => {
            setShowNoteModal(false);
            setSelectedHelperPoint(null);
          }}
          onSave={handleNoteSubmit}
        />
      )}

      {showWinModal && (
        <WinModal 
        onClose={() => setShowWinModal(false)} 
        onContinueExploring={handleContinueExploring}
        />
      )}
    </div>
  );
  };

export default GameSession;