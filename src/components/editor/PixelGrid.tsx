import React from 'react';

interface PixelGridProps {
  grid: (string | null)[][];
  selectedColor: string;
  onPixelClick: (row: number, col: number) => void;
  layerType: 'background' | 'objects' | 'details';
}
const PixelGrid: React.FC<PixelGridProps> = ({ grid, selectedColor, onPixelClick }) => {
  const getCheckerboardColor = (row: number, col: number) => {
    return (row + col) % 2 === 0 ? '#d6c7a3' : '#dbcfb1';
  };

  return (
    <div className="inline-block bg-[#e6d9bd] rounded-lg p-3 border-4 border-[#937b6a] shadow-[4px_4px_0px_#937b6a]">
      <div className="grid grid-cols-10 gap-px bg-[#937b6a] p-px">
        {grid.map((row, rowIndex) => (
          row.map((color, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className="w-8 h-8 transition-colors duration-200 hover:opacity-80 relative"
              onClick={() => onPixelClick(rowIndex, colIndex)}
              aria-label={`Pixel at row ${rowIndex}, column ${colIndex}`}
            >
              <div
                className="absolute inset-0"
                style={{ backgroundColor: getCheckerboardColor(rowIndex, colIndex) }}
              />
              {color && (
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: color }}
                />
              )}
            </button>
          ))
        ))}
      </div>
    </div>
  );
};

export default PixelGrid;