import React, { useState, useCallback, useEffect } from 'react';
import type { PlayerData } from '@/types';
import PixelGrid from './PixelGrid';

interface PlayerEditorProps {
  selectedColor: string;
  isEraser: boolean;
  onComplete?: (data: PlayerData) => void;
}

const createEmptyGrid = () => Array(10).fill(null).map(() => Array(10).fill(null));

const PlayerEditor: React.FC<PlayerEditorProps> = ({ selectedColor, isEraser }) => {
  const [grid, setGrid] = useState<(string | null)[][]>(createEmptyGrid());

  // Load saved player data when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem('player-sprite');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.pixels && Array.isArray(parsed.pixels)) {
          setGrid(parsed.pixels);
        }
      } catch (error) {
        console.error('Error loading player data:', error);
      }
    }
  }, []);

  const handlePixelClick = useCallback((row: number, col: number) => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(r => [...r]);
      newGrid[row][col] = isEraser ? null : selectedColor;
      
      // Save to localStorage whenever the grid changes
      const playerData = {
        pixels: newGrid,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('player-sprite', JSON.stringify(playerData));
      
      return newGrid;
    });
  }, [selectedColor, isEraser]);

  const handleSave = () => {
    const playerData = {
      pixels: grid,
      timestamp: new Date().toISOString()
    };
    
    // Save to both localStorage and file
    localStorage.setItem('player-sprite', JSON.stringify(playerData));
    
    const blob = new Blob([JSON.stringify(playerData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'player-sprite.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          if (content.pixels && Array.isArray(content.pixels)) {
            setGrid(content.pixels);
            // Also save to localStorage when loading from file
            localStorage.setItem('player-sprite', JSON.stringify({
              pixels: content.pixels,
              timestamp: new Date().toISOString()
            }));
          }
        } catch (error) {
          console.error('Error loading file:', error);
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-pixel text-[#937b6a] mb-4">Player Editor</h2>
      
      <div className="flex-grow flex flex-col items-center justify-center space-y-6">
        <div className="relative group">
          <PixelGrid
            grid={grid}
            onPixelClick={handlePixelClick}
            layerType='objects'
          />
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#87a985] text-[#e6d9bd] rounded-lg border-4 border-[#6f8b6e] shadow-[4px_4px_0px_#6f8b6e] hover:bg-[#6f8b6e] transition-colors font-pixel"
          >
            Save to File
          </button>
          
          <label className="px-6 py-2 bg-[#ada387] text-[#e6d9bd] rounded-lg border-4 border-[#937b6a] shadow-[4px_4px_0px_#937b6a] hover:bg-[#937b6a] transition-colors cursor-pointer font-pixel">
            Load from File
            <input
              type="file"
              accept=".json"
              onChange={handleLoad}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default PlayerEditor;