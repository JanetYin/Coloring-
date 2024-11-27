import React, { useState, useEffect } from 'react';
import { PencilIcon, EraserIcon } from './RetroIcons';

export const defaultColors = [
  '#eee1c4', '#e6d9bd', '#dbcfb1', '#d6c7a3', '#c3b797',
  '#ada387', '#cc9970', '#a97e5c', '#937b6a', '#a0a0a0',
  '#838383', '#9eb5c0', '#839ca9', '#6d838e', '#c87e7e',
  '#a05e5e', '#b089ab', '#8e6d89', '#b9ab73', '#978c63',
  '#87a985', '#6f8b6e'
];

interface ColorPaletteProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  isEraser: boolean;
  setIsEraser: (isEraser: boolean) => void;
  showDrawingTools?: boolean; // New prop
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ 
  selectedColor, 
  onColorSelect,
  isEraser,
  setIsEraser,
  showDrawingTools = true // Default to true for backward compatibility
}) => {
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState('#000000');

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!showDrawingTools) return; // Don't handle shortcuts if drawing tools are hidden
      
      if (e.key.toLowerCase() === 'p') {
        setIsEraser(false);
      } else if (e.key.toLowerCase() === 'e') {
        setIsEraser(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setIsEraser, showDrawingTools]);

  const handleAddColor = () => {
    if (!customColors.includes(tempColor)) {
      setCustomColors(prev => [...prev, tempColor]);
      onColorSelect(tempColor);
    }
    setShowColorPicker(false);
  };

  return (
    <div className="space-y-4">
      {/* Only show drawing tools if showDrawingTools is true */}
      {showDrawingTools && (
        <div className="flex gap-4 items-center mb-4">
          <button
            onClick={() => setIsEraser(false)}
            className={`px-4 py-2 rounded-lg font-pixel flex items-center gap-2 transition-colors
              ${!isEraser
                ? 'bg-[#87a985] text-[#e6d9bd] border-4 border-[#6f8b6e] shadow-[4px_4px_0px_#6f8b6e]'
                : 'text-[#937b6a] hover:bg-[#dbcfb1] border-4 border-[#937b6a] shadow-[4px_4px_0px_#937b6a]'
              }`}
          >
            <PencilIcon /> Pencil (P)
          </button>
          <button
            onClick={() => setIsEraser(true)}
            className={`px-4 py-2 rounded-lg font-pixel flex items-center gap-2 transition-colors
              ${isEraser
                ? 'bg-[#87a985] text-[#e6d9bd] border-4 border-[#6f8b6e] shadow-[4px_4px_0px_#6f8b6e]'
                : 'text-[#937b6a] hover:bg-[#dbcfb1] border-4 border-[#937b6a] shadow-[4px_4px_0px_#937b6a]'
              }`}
          >
            <EraserIcon /> Eraser (E)
          </button>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex-1 flex flex-wrap gap-2">
          {[...defaultColors, ...customColors].map((color, index) => (
            <button
              key={index}
              className={`w-8 h-8 rounded-lg border-4 transition-transform hover:scale-110
                ${selectedColor === color && (!showDrawingTools || !isEraser)
                  ? 'border-[#6f8b6e] shadow-[2px_2px_0px_#6f8b6e]'
                  : 'border-[#937b6a] shadow-[2px_2px_0px_#937b6a]'
                }`}
              style={{ backgroundColor: color }}
              onClick={() => {
                onColorSelect(color);
                if (showDrawingTools) {
                  setIsEraser(false);
                }
              }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-8 h-8 rounded-lg border-4 border-[#937b6a] bg-[#e6d9bd] flex items-center justify-center hover:bg-[#dbcfb1] shadow-[2px_2px_0px_#937b6a]"
            aria-label="Add custom color"
          >
            <span className="text-2xl text-[#937b6a]">+</span>
          </button>

          {showColorPicker && (
            <div className="absolute right-0 top-10 bg-[#e6d9bd] p-4 rounded-lg border-4 border-[#937b6a] shadow-[4px_4px_0px_#937b6a] z-50">
              <input
                type="color"
                value={tempColor}
                onChange={(e) => setTempColor(e.target.value)}
                className="w-32 h-32 mb-2 rounded cursor-pointer"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddColor}
                  className="flex-1 px-3 py-1 bg-[#87a985] text-[#e6d9bd] rounded-lg border-4 border-[#6f8b6e] shadow-[2px_2px_0px_#6f8b6e] hover:bg-[#6f8b6e] font-pixel"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowColorPicker(false)}
                  className="flex-1 px-3 py-1 bg-[#ada387] text-[#e6d9bd] rounded-lg border-4 border-[#937b6a] shadow-[2px_2px_0px_#937b6a] hover:bg-[#937b6a] font-pixel"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorPalette;