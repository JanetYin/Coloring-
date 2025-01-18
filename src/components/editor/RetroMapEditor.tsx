'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload } from 'lucide-react';
import ColorPalette from '../shared/ColorPalette';
import type { MapEditorMode, MapData, InteractiveTile, RecoveryArea, TestCase } from '@/types';
import RecoveryAreaModal from '../shared/RecoveryAreaModal';

const RetroMapEditor: React.FC = () => {
  const GRID_WIDTH = 1080;
  const GRID_HEIGHT = 460;
  const CELL_SIZE = 10;
  const COLS = Math.floor(GRID_WIDTH / CELL_SIZE);
  const ROWS = Math.floor(GRID_HEIGHT / CELL_SIZE);

  // State
  const [selectedColor, setSelectedColor] = useState('#eee1c4');
  const [isDrawing, setIsDrawing] = useState(false);
  const [editorMode, setEditorMode] = useState<MapEditorMode>('background');
  const [isPuzzleMode, setIsPuzzleMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedTile, setSelectedTile] = useState<InteractiveTile | null>(null);
  const [showPuzzleEditor, setShowPuzzleEditor] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [showRecoveryAreaModal, setShowRecoveryAreaModal] = useState(false);

  // Store original colors for preview mode
  const [previewOriginalColors, setPreviewOriginalColors] = useState<string[][]>([]);

  // Add viewport control for main grid
  const [mapViewport, setMapViewport] = useState({ x: 0, y: 0 });
  const [isDraggingMap, setIsDraggingMap] = useState(false);
  const [lastMapMousePos, setLastMapMousePos] = useState({ x: 0, y: 0 });

  // Puzzle Editor State
  const [puzzleDescription, setPuzzleDescription] = useState('');
  const [puzzleHints, setPuzzleHints] = useState<string[]>([]);
  const [puzzleTestCases, setPuzzleTestCases] = useState<TestCase[]>([]);

  // Layers
  const [backgroundLayer, setBackgroundLayer] = useState<string[][]>(() => 
    Array(ROWS).fill(null).map(() => Array(COLS).fill('#eee1c4')) //'#eee1c4'
  );
  const [objectsLayer, setObjectsLayer] = useState<string[][]>(() => 
    Array(ROWS).fill(null).map(() => Array(COLS).fill(''))
  );
  const [interactiveTiles, setInteractiveTiles] = useState<InteractiveTile[]>([]);
  const [originalColors, setOriginalColors] = useState<string[][]>(() => 
    Array(ROWS).fill(null).map(() => Array(COLS).fill('#eee1c4'))
  );
  const [recoveredAreas, setRecoveredAreas] = useState<boolean[][]>(() => 
    Array(ROWS).fill(null).map(() => Array(COLS).fill(false))
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertToGrayscale = (color: string): string => {
    if (!color || color === '') return color;
    
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    const grayHex = gray.toString(16).padStart(2, '0');
    return `#${grayHex}${grayHex}${grayHex}`;
  };

  const togglePreviewMode = () => {
      if (!isPreviewMode) {
        setPreviewOriginalColors(JSON.parse(JSON.stringify(backgroundLayer)));
        
        // Convert background and objects to grayscale, except for interactive tile positions
        const grayscaleBackground = backgroundLayer.map((row, rowIndex) => 
          row.map((color, colIndex) => {
            const hasInteractiveTile = interactiveTiles.some(
              tile => tile.position.row === rowIndex && tile.position.col === colIndex
            );
            return hasInteractiveTile ? color : convertToGrayscale(color);
          })
        );
        setBackgroundLayer(grayscaleBackground);
        
        const grayscaleObjects = objectsLayer.map((row, rowIndex) => 
          row.map((color, colIndex) => {
            const hasInteractiveTile = interactiveTiles.some(
              tile => tile.position.row === rowIndex && tile.position.col === colIndex
            );
            return hasInteractiveTile ? color : (color ? convertToGrayscale(color) : '');
          })
        );
        setObjectsLayer(grayscaleObjects);
        setIsPreviewMode(true);
      } else {
        // Exiting preview mode
        setBackgroundLayer(previewOriginalColors);
        setObjectsLayer(objectsLayer.map(row => 
          row.map(color => color ? color : '')
        ));
        setIsPreviewMode(false);
      }
    };



  const recoverArea = (tile: InteractiveTile) => {
    if (!isPuzzleMode || !tile.recoveryArea) return;
  
    const newBackgroundLayer = [...backgroundLayer];
    const newObjectsLayer = [...objectsLayer];
    const newRecoveredAreas = [...recoveredAreas];
    const { startRow, startCol, endRow, endCol } = tile.recoveryArea;
  
    for (let i = startRow; i <= endRow; i++) {
      for (let j = startCol; j <= endCol; j++) {
        if (i >= 0 && i < ROWS && j >= 0 && j < COLS) {
          newBackgroundLayer[i][j] = originalColors[i][j];
          newObjectsLayer[i][j] = objectsLayer[i][j];
          newRecoveredAreas[i][j] = true;
        }
      }
    }
  
    setBackgroundLayer(newBackgroundLayer);
    setObjectsLayer(newObjectsLayer);
    setRecoveredAreas(newRecoveredAreas);
  };


  const handleRecoveryAreaSave = (area: RecoveryArea) => {
    if (!selectedTile) return;
  
    const updatedTile: InteractiveTile = {
      ...selectedTile,
      recoveryArea: area
    };
  
    setInteractiveTiles(interactiveTiles.map(tile => 
      tile.id === selectedTile.id ? updatedTile : tile
    ));
    setShowRecoveryAreaModal(false);
    setSelectedTile(null);
  };
  
  const handleCellClick = (row: number, col: number) => {
    if (editorMode === 'interactive') {
      const newTile: InteractiveTile = {
        position: { x: col * CELL_SIZE, y: row * CELL_SIZE, row, col },
        type: 'trigger',
        id: `trigger_${Date.now()}`
      };
      setInteractiveTiles([...interactiveTiles, newTile]);
      setSelectedTile(newTile);
      setShowPuzzleEditor(true);
      return;
    }

    const newLayer = [...(editorMode === 'background' ? backgroundLayer : objectsLayer)];
    if (isEraser) {
      if (editorMode === 'background') {
        newLayer[row][col] = '#eee1c4'; 
      } else {
        newLayer[row][col] = '';
      }
    } else {
      newLayer[row][col] = selectedColor;
    }

    if (editorMode === 'background') {
      setBackgroundLayer(newLayer);
    } else {
      setObjectsLayer(newLayer);
    }
  };

  const handleMouseDown = (row: number, col: number) => {
    setIsDrawing(true);
    handleCellClick(row, col);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isDrawing || editorMode === 'interactive') return;
    handleCellClick(row, col);
  };

  const handlePuzzleSubmit = () => {
    if (!selectedTile) return;
  
    const updatedTile: InteractiveTile = {
      ...selectedTile,
      puzzle: {
        description: puzzleDescription,
        hints: puzzleHints,
        testCases: puzzleTestCases,
      }
    };
  
    setInteractiveTiles(interactiveTiles.map(tile => 
      tile.id === selectedTile.id ? updatedTile : tile
    ));
  
    setPuzzleDescription('');
    setPuzzleHints([]);
    setPuzzleTestCases([]);
    setShowPuzzleEditor(false);
    setSelectedTile(null);
  };

  const addHint = () => setPuzzleHints([...puzzleHints, '']);
  const updateHint = (index: number, value: string) => {
    const newHints = [...puzzleHints];
    newHints[index] = value;
    setPuzzleHints(newHints);
  };
  const removeHint = (index: number) => {
    setPuzzleHints(puzzleHints.filter((_, i) => i !== index));
  };

  const addTestCase = (isHidden: boolean = false) => {
    setPuzzleTestCases([...puzzleTestCases, {
      input: '',
      expectedOutput: '',
      isHidden
    }]);
  };
  const updateTestCase = (index: number, field: keyof TestCase, value: string | boolean) => {
    const newTestCases = [...puzzleTestCases];
    newTestCases[index] = {
      ...newTestCases[index],
      [field]: value
    };
    setPuzzleTestCases(newTestCases);
  };
  
  const removeTestCase = (index: number) => {
    setPuzzleTestCases(puzzleTestCases.filter((_, i) => i !== index));
  };
  const saveMap = () => {
    const mapData: MapData = {
      backgroundLayer,
      objectsLayer,
      interactiveTiles,
      originalColors: isPuzzleMode ? originalColors : undefined,
      recoveredAreas: isPuzzleMode ? recoveredAreas : undefined
    };

    const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'map-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadMap = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const mapData: MapData = JSON.parse(e.target?.result as string);
        if (mapData.backgroundLayer) setBackgroundLayer(mapData.backgroundLayer);
        if (mapData.objectsLayer) setObjectsLayer(mapData.objectsLayer);
        if (mapData.interactiveTiles) setInteractiveTiles(mapData.interactiveTiles);
        if (mapData.originalColors) setOriginalColors(mapData.originalColors);
        if (mapData.recoveredAreas) setRecoveredAreas(mapData.recoveredAreas);
        setIsPuzzleMode(Boolean(mapData.originalColors));
      } catch (error) {
        alert(`Error loading map file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
  };

  const removeInteractiveTile = (id: string) => {
    setInteractiveTiles(interactiveTiles.filter(tile => tile.id !== id));
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDrawing(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-[1200px] mx-auto p-6 gap-6">
      {/* Mode Controls */}
      <div className="flex gap-4 mb-4">
        {/* Preview Mode Toggle */}
        <button
          className={`px-4 py-2 rounded-lg font-pixel text-lg 
            ${isPreviewMode 
              ? 'bg-[#ada387] text-[#e6d9bd] border-4 border-[#937b6a] shadow-[4px_4px_0px_#937b6a]'
              : 'bg-[#87a985] text-[#e6d9bd] border-4 border-[#6f8b6e] shadow-[4px_4px_0px_#6f8b6e] hover:bg-[#6f8b6e]'}`}
          onClick={togglePreviewMode}
        >
          {isPreviewMode ? 'Exit Preview' : 'Preview Mode'}
        </button>

       {/* Editor Mode Selection */}
       {!isPreviewMode && (
          <div className="flex gap-2">
            {(['background', 'objects', 'interactive'] as const).map((mode) => (
              <button
                key={mode}
                className={`px-4 py-2 rounded-lg font-pixel text-lg 
                  ${editorMode === mode 
                    ? 'bg-[#87a985] text-[#e6d9bd] border-4 border-[#6f8b6e] shadow-[4px_4px_0px_#6f8b6e]'
                    : 'bg-[#e6d9bd] text-[#937b6a] border-4 border-[#937b6a] shadow-[4px_4px_0px_#937b6a]'}`}
                onClick={() => setEditorMode(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Color Palette */}
      {(editorMode === 'background' || editorMode === 'objects') && (
        <div className="w-full bg-[#e6d9bd] rounded-lg border-4 border-[#937b6a] shadow-[4px_4px_0px_#937b6a] p-4">
          <ColorPalette
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
            isEraser={isEraser}
            setIsEraser={setIsEraser}
          />
        </div>
      )}

      {/* Grid */}
      <div className="bg-[#e6d9bd] p-4 rounded-lg border-4 border-[#937b6a] shadow-[4px_4px_0px_#937b6a] 
                w-full h-[600px] overflow-hidden relative">
  <div className="absolute top-2 right-2 bg-[#937b6a] text-[#e6d9bd] px-2 py-1 rounded font-pixel text-sm z-10">
    Middle-click and drag to pan
  </div>
  <div
    className="relative"
    style={{
      transform: `translate(${mapViewport.x}px, ${mapViewport.y}px)`,
      cursor: isDraggingMap ? 'grabbing' : 'grab'
    }}
    onMouseDown={(e) => {
      if (e.button === 1) { // Middle mouse button
        setIsDraggingMap(true);
        setLastMapMousePos({ x: e.clientX, y: e.clientY });
      }
    }}
    onMouseMove={(e) => {
      if (!isDraggingMap) return;
      const dx = e.clientX - lastMapMousePos.x;
      const dy = e.clientY - lastMapMousePos.y;
      setMapViewport(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      setLastMapMousePos({ x: e.clientX, y: e.clientY });
    }}
    onMouseUp={() => setIsDraggingMap(false)}
    onMouseLeave={() => setIsDraggingMap(false)}
  >
    <div 
      className="grid relative"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
        gap: '1px',
        backgroundColor: '#ccc'
      }}
    >
              {backgroundLayer.map((row, rowIndex) => 
              row.map((cellColor, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="cursor-pointer relative"
                  style={{
                    width: `${CELL_SIZE}px`,
                    height: `${CELL_SIZE}px`,
                    backgroundColor: cellColor,
                  }}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                >
                  {objectsLayer[rowIndex][colIndex] && (
                    <div
                      className="absolute inset-0"
                      style={{ backgroundColor: objectsLayer[rowIndex][colIndex] }}
                    />
                  )}
                  {/* Remove the T indicator div and only keep the recovery area indicator */}
                  {interactiveTiles.map(tile => 
                    tile.recoveryArea && 
                    rowIndex >= tile.recoveryArea.startRow && 
                    rowIndex <= tile.recoveryArea.endRow && 
                    colIndex >= tile.recoveryArea.startCol && 
                    colIndex <= tile.recoveryArea.endCol ? (
                      <div 
                        key={tile.id}
                        className="absolute inset-0 border border-[#87a985] border-opacity-50" 
                      />
                    ) : null
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={saveMap}
          className="px-4 py-2 bg-[#87a985] text-[#e6d9bd] rounded-lg font-pixel 
                    border-4 border-[#6f8b6e] shadow-[4px_4px_0px_#6f8b6e] hover:bg-[#6f8b6e]
                    flex items-center gap-2"
        >
          <Download size={20} />
          Save Map
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-[#ada387] text-[#e6d9bd] rounded-lg font-pixel
                    border-4 border-[#937b6a] shadow-[4px_4px_0px_#937b6a] hover:bg-[#937b6a]
                    flex items-center gap-2"
        >
          <Upload size={20} />
          Load Map
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={loadMap}
        />
      </div>

      {/* Puzzle Editor Modal */}
      {showPuzzleEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#e6d9bd] p-6 rounded-lg border-4 border-[#937b6a] shadow-[4px_4px_0px_#937b6a] 
                        max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold font-pixel text-[#937b6a] mb-4">Add Puzzle Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block font-pixel text-[#937b6a] mb-2">Description</label>
                <textarea
                  className="w-full p-2 border-2 border-[#937b6a] rounded bg-white font-pixel"
                  rows={4}
                  value={puzzleDescription}
                  onChange={(e) => setPuzzleDescription(e.target.value)}
                  placeholder="Enter puzzle description..."
                />
              </div>

              <div>
                <label className="block font-pixel text-[#937b6a] mb-2">Hints</label>
                {puzzleHints.map((hint, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 p-2 border-2 border-[#937b6a] rounded bg-white font-pixel"
                      value={hint}
                      onChange={(e) => updateHint(index, e.target.value)}
                      placeholder={`Hint ${index + 1}`}
                    />
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded font-pixel
                                border-2 border-red-700 shadow-[2px_2px_0px_#7f1d1d]"
                      onClick={() => removeHint(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  className="px-4 py-2 bg-[#87a985] text-[#e6d9bd] rounded font-pixel
                            border-2 border-[#6f8b6e] shadow-[2px_2px_0px_#6f8b6e]"
                  onClick={addHint}
                >
                  Add Hint
                </button>
              </div>

              <div>
                <label className="block font-pixel text-[#937b6a] mb-2">Test Cases</label>
                {puzzleTestCases.map((testCase, index) => (
                  <div key={index} className="mb-4 p-4 bg-[#f5ecd5] rounded-lg border-2 border-[#937b6a]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-pixel text-[#937b6a]">Test Case {index + 1}</span>
                      <div className="flex gap-2">
                        <button
                          className={`px-3 py-1 rounded font-pixel text-sm
                            ${testCase.isHidden 
                              ? 'bg-yellow-500 text-white border-2 border-yellow-600' 
                              : 'bg-blue-500 text-white border-2 border-blue-600'
                            }`}
                          onClick={() => updateTestCase(index, 'isHidden', !testCase.isHidden)}
                        >
                          {testCase.isHidden ? 'Hidden' : 'Visible'}
                        </button>
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded font-pixel
                                    border-2 border-red-700 shadow-[2px_2px_0px_#7f1d1d]"
                          onClick={() => removeTestCase(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="block font-pixel text-[#937b6a] text-sm mb-1">Input</label>
                        <input
                          type="text"
                          className="w-full p-2 border-2 border-[#937b6a] rounded bg-white font-pixel"
                          value={testCase.input}
                          onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                          placeholder="Test input..."
                        />
                      </div>
                      <div>
                        <label className="block font-pixel text-[#937b6a] text-sm mb-1">Expected Output</label>
                        <input
                          type="text"
                          className="w-full p-2 border-2 border-[#937b6a] rounded bg-white font-pixel"
                          value={testCase.expectedOutput}
                          onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                          placeholder="Expected output..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 bg-[#87a985] text-[#e6d9bd] rounded font-pixel
                              border-2 border-[#6f8b6e] shadow-[2px_2px_0px_#6f8b6e]"
                    onClick={() => addTestCase(false)}
                  >
                    Add Visible Test Case
                  </button>
                  <button
                    className="px-4 py-2 bg-yellow-500 text-white rounded font-pixel
                              border-2 border-yellow-600 shadow-[2px_2px_0px_#b45309]"
                    onClick={() => addTestCase(true)}
                  >
                    Add Hidden Test Case
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-[#ada387] text-[#e6d9bd] rounded font-pixel
                          border-4 border-[#937b6a] shadow-[4px_4px_0px_#937b6a]"
                onClick={() => setShowPuzzleEditor(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#87a985] text-[#e6d9bd] rounded font-pixel
                          border-4 border-[#6f8b6e] shadow-[4px_4px_0px_#6f8b6e]"
                onClick={handlePuzzleSubmit}
              >
                Save Puzzle
              </button>
            </div>
          </div>
        </div>
      )}
      


      {/* Interactive Tiles List */}
      {interactiveTiles.length > 0 && (
        <div className="w-full bg-[#e6d9bd] rounded-lg border-4 border-[#937b6a] shadow-[4px_4px_0px_#937b6a] p-4">
          <h3 className="font-pixel text-[#937b6a] text-lg mb-4">Interactive Tiles</h3>
          <div className="space-y-4">
            {interactiveTiles.map((tile) => (
              <div key={tile.id} className="bg-white p-4 rounded border-2 border-[#937b6a]">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-pixel text-[#937b6a]">
                    Trigger at ({tile.position.row}, {tile.position.col})
                  </span>
                  <div className="flex gap-2">
                    {isPuzzleMode && (
                        <button 
                        className="px-3 py-1 bg-[#87a985] text-[#e6d9bd] rounded font-pixel
                                  border-2 border-[#6f8b6e] shadow-[2px_2px_0px_#6f8b6e]"
                        onClick={() => recoverArea(tile)}
                      >
                        Test Recover
                      </button>
                    )}
                    <button
                      className="px-3 py-1 bg-[#ada387] text-[#e6d9bd] rounded font-pixel
                                border-2 border-[#937b6a] shadow-[2px_2px_0px_#937b6a]"
                      onClick={() => {
                        setSelectedTile(tile);
                        if (tile.puzzle) {
                          setPuzzleDescription(tile.puzzle.description);
                          setPuzzleHints(tile.puzzle.hints);
                          setPuzzleTestCases(tile.puzzle.testCases);
                          setShowPuzzleEditor(true);
                        }
                        setShowPuzzleEditor(true);
                      }}
                    >
                      Edit Puzzle
                    </button>
                    <button
                      className="px-3 py-1 bg-[#87a985] text-[#e6d9bd] rounded font-pixel
                                border-2 border-[#6f8b6e] shadow-[2px_2px_0px_#6f8b6e]"
                      onClick={() => {
                        setSelectedTile(tile);
                        setShowRecoveryAreaModal(true);
                      }}
                    >
                      Set Recovery Area
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded font-pixel
                                border-2 border-red-700 shadow-[2px_2px_0px_#7f1d1d]"
                      onClick={() => removeInteractiveTile(tile.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {tile.puzzle && (
                  <div className="mt-2 text-sm font-pixel">
                    <p className="text-[#937b6a] font-medium">Description:</p>
                    <p className="mb-2 text-[#937b6a]">{tile.puzzle.description}</p>
                    {tile.puzzle.hints.length > 0 && (
                      <>
                        <p className="text-[#937b6a] font-medium">Hints:</p>
                        <ul className="list-disc ml-4 mb-2 text-[#937b6a]">
                          {tile.puzzle.hints.map((hint, i) => (
                            <li key={i}>{hint}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {tile.puzzle.testCases.length > 0 && (
                      <>
                        <p className="text-[#937b6a] font-medium">Test Cases:</p>
                        <div className="space-y-2 ml-4">
                          {tile.puzzle.testCases.map((testCase, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                testCase.isHidden 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {testCase.isHidden ? 'Hidden' : 'Visible'}
                              </span>
                              <span className="text-[#937b6a]">
                                Input: {testCase.input} | Output: {testCase.isHidden ? '[Hidden]' : testCase.expectedOutput}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  
                  </div>
                )}
                {tile.recoveryArea && (
                  <div className="mt-2 text-sm font-pixel">
                    <p className="text-[#937b6a] font-medium">Recovery Area:</p>
                    <p className="text-[#937b6a]">
                      From ({tile.recoveryArea.startRow}, {tile.recoveryArea.startCol}) to ({tile.recoveryArea.endRow}, {tile.recoveryArea.endCol})
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {showRecoveryAreaModal && (
        <RecoveryAreaModal
          onClose={() => {
            setShowRecoveryAreaModal(false);
            setSelectedTile(null);
          }}
          onSave={handleRecoveryAreaSave}
          gridSize={{ rows: ROWS, cols: COLS }}
          cellSize={CELL_SIZE}
          currentColors={backgroundLayer}
          objectsLayer={objectsLayer}
          interactiveTiles={interactiveTiles}
          initialArea={selectedTile?.recoveryArea}
        />
      )}
        

    </div>
  );
};

export default RetroMapEditor;