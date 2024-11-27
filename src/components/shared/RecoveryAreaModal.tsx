import React, { useState, useEffect } from 'react';
import type { RecoveryArea, InteractiveTile } from '@/types';
import { Move } from 'lucide-react';

interface RecoveryAreaModalProps {
  onClose: () => void;
  onSave: (area: RecoveryArea) => void;
  gridSize: { rows: number; cols: number };
  cellSize: number;
  currentColors: string[][];
  objectsLayer: string[][];
  interactiveTiles: InteractiveTile[];
  initialArea?: RecoveryArea;
}

const RecoveryAreaModal: React.FC<RecoveryAreaModalProps> = ({
  onClose,
  onSave,
  gridSize,
  cellSize,
  currentColors,
  objectsLayer,
  interactiveTiles,
  initialArea
}) => {
  const [selectionStart, setSelectionStart] = useState<{row: number; col: number} | null>(null);
  const [currentArea, setCurrentArea] = useState<RecoveryArea | null>(initialArea || null);
  const [isSelecting, setIsSelecting] = useState(!initialArea);
  const [isDragging, setIsDragging] = useState(false);
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Reset scroll position when modal opens
    setViewportOffset({ x: 0, y: 0 });
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (!isSelecting) return;

    if (!selectionStart) {
      setSelectionStart({ row, col });
    } else {
      const area: RecoveryArea = {
        startRow: Math.min(selectionStart.row, row),
        startCol: Math.min(selectionStart.col, col),
        endRow: Math.max(selectionStart.row, row),
        endCol: Math.max(selectionStart.col, col)
      };
      setCurrentArea(area);
      setSelectionStart(null);
      setIsSelecting(false);
    }
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isSelecting || !selectionStart) return;
    
    const tempArea: RecoveryArea = {
      startRow: Math.min(selectionStart.row, row),
      startCol: Math.min(selectionStart.col, col),
      endRow: Math.max(selectionStart.row, row),
      endCol: Math.max(selectionStart.col, col)
    };
    setCurrentArea(tempArea);
  };

  const handleDragStart = (e: React.MouseEvent) => {
    if (e.button === 1) { // Middle mouse button
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;

    setViewportOffset(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const isInArea = (row: number, col: number) => {
    if (!currentArea) return false;
    return row >= currentArea.startRow && row <= currentArea.endRow &&
           col >= currentArea.startCol && col <= currentArea.endCol;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#e6d9bd] p-6 rounded-lg border-4 border-[#937b6a] shadow-[4px_4px_0px_#937b6a] 
                    w-[90vw] h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold font-pixel text-[#937b6a]">
            {isSelecting ? (
              selectionStart ? 'Click to set end point' : 'Click to set start point'
            ) : 'Recovery Area Selected'}
          </h2>
          <div className="flex items-center gap-2 font-pixel text-[#937b6a]">
            <Move className="h-5 w-5" />
            Middle-click and drag to pan
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-white rounded-lg border-2 border-[#937b6a] relative">
          <div 
            className="absolute inset-0 overflow-auto"
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              transform: `translate(${viewportOffset.x}px, ${viewportOffset.y}px)`
            }}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          >
            <div 
              className="grid gap-px bg-gray-200"
              style={{
                gridTemplateColumns: `repeat(${gridSize.cols}, ${cellSize}px)`,
                padding: '1px'
              }}
            >
              {Array.from({ length: gridSize.rows }).map((_, row) =>
                Array.from({ length: gridSize.cols }).map((_, col) => {
                  // Check if there's an interactive tile at this position
                  const interactiveTile = interactiveTiles.find(tile => 
                    tile.position.row === row && tile.position.col === col
                  );

                  return (
                    <div
                      key={`${row}-${col}`}
                      className="relative cursor-crosshair"
                      style={{
                        width: cellSize,
                        height: cellSize,
                        // If it's an interactive tile, use the original color, otherwise use current color
                        backgroundColor: interactiveTile ? currentColors[row][col] : currentColors[row][col],
                      }}
                      onClick={() => handleCellClick(row, col)}
                      onMouseEnter={() => handleMouseEnter(row, col)}
                    >
                      {/* Objects Layer */}
                      {objectsLayer[row][col] && (
                        <div
                          className="absolute inset-0"
                          style={{ 
                            backgroundColor: interactiveTile ? objectsLayer[row][col] : objectsLayer[row][col]
                          }}
                        />
                      )}
                      {/* Selection Overlay */}
                      {isInArea(row, col) && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-30 border border-blue-600 z-10" />
                      )}
                      {/* Grid Lines */}
                      <div className="absolute inset-0 border border-gray-200 pointer-events-none" />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          {!isSelecting && (
            <button
              className="px-4 py-2 bg-[#ada387] text-[#e6d9bd] rounded font-pixel
                      border-4 border-[#937b6a] shadow-[4px_4px_0px_#937b6a]"
              onClick={() => {
                setIsSelecting(true);
                setSelectionStart(null);
                setCurrentArea(null);
              }}
            >
              Reset Selection
            </button>
          )}
          <button
            className="px-4 py-2 bg-[#ada387] text-[#e6d9bd] rounded font-pixel
                    border-4 border-[#937b6a] shadow-[4px_4px_0px_#937b6a]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-[#87a985] text-[#e6d9bd] rounded font-pixel
                    border-4 border-[#6f8b6e] shadow-[4px_4px_0px_#6f8b6e]"
            onClick={() => currentArea && onSave(currentArea)}
            disabled={!currentArea}
          >
            Save Area
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecoveryAreaModal;