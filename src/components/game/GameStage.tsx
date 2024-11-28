import React, { useState } from 'react';
import { MapData, InteractiveTile, HelperPoint } from '@/types';
import { User, Paintbrush, Target, Eye, EyeOff, Star, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ColorPalette from '@/components/shared/ColorPalette';
import { Pixelify_Sans } from 'next/font/google';

const pixelifySans = Pixelify_Sans({ subsets: ['latin'], weight: ['400', '500', '700'] });

interface GameStageProps {
  mapData: MapData;
  onTriggerPuzzle: (tile: InteractiveTile) => void;
  selectedColor: string;
  isEraser: boolean;
  setSelectedColor: (color: string) => void;
  setIsEraser: (value: boolean) => void;
  onCellClick: (rowIndex: number, colIndex: number) => void;
  isPlacingPlayer: boolean;
  setIsPlacingPlayer: (value: boolean) => void;
  helperPoints: HelperPoint[];
  showHelpers: boolean;
  isHelperMode: boolean;
  currentMode: 'player' | 'draw' | 'helper';
  setCurrentMode: (mode: 'player' | 'draw' | 'helper') => void;
  onHelperPointClick: (point: HelperPoint) => void;
  toggleHelperVisibility: () => void;
  onExportPNG: () => Promise<void>;
  onExportJSON: () => void;
  isDrawingAllowed: boolean;
}

const GameStage: React.FC<GameStageProps> = ({ 
  mapData, 
  onTriggerPuzzle, 
  selectedColor,
  isEraser,
  setSelectedColor,
  setIsEraser,
  onCellClick,
  isPlacingPlayer,
  helperPoints,
  showHelpers,
  currentMode,
  setCurrentMode,
  onHelperPointClick,
  toggleHelperVisibility,
  onExportPNG,
  onExportJSON,
  isDrawingAllowed
}) => {
  const router = useRouter();
  const [showLockTooltip, setShowLockTooltip] = useState(false);
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);
  
  const CELL_SIZE = 8;
  const COLS = mapData.backgroundLayer[0].length;
  const ROWS = mapData.backgroundLayer.length;
  
  const containerWidth = Math.min(1200, window.innerWidth - 48);
  const containerHeight = 600;
  
  const scaleX = containerWidth / (COLS * CELL_SIZE);
  const scaleY = containerHeight / (ROWS * CELL_SIZE);
  const scale = Math.min(scaleX, scaleY);

  const shouldShowPalette = () => {
    if (currentMode === 'helper') return true;
    if (currentMode === 'draw' && isDrawingAllowed) return true;
    return false;
  };

  const shouldShowDrawingTools = () => {
    return currentMode === 'draw' && isDrawingAllowed;
  };

  return (
    <div className="w-full">
      <div className="w-full bg-[#e6d9bd] border-b-4 border-[#937b6a] px-8 py-4 mb-8">
        <h2 
          onClick={() => router.push('/')}
          className={`${pixelifySans.className} text-3xl text-[#87a985] cursor-pointer hover:text-[#6f8b6e] transition-colors w-fit`}
        >
          Coloring!
        </h2>
      </div>

      <div className="w-full max-w-[1200px] mx-auto px-6 mb-4">
        <div className="bg-[#e6d9bd] p-4 rounded-lg border-4 border-[#937b6a] shadow-[4px_4px_0px_#937b6a]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentMode('player')}
                className={`px-4 py-2 rounded font-pixel flex items-center gap-2 ${
                  currentMode === 'player'
                    ? 'bg-[#87a985] text-[#e6d9bd] border-2 border-[#6f8b6e]'
                    : 'bg-[#e6d9bd] text-[#937b6a] border-2 border-[#937b6a]'
                }`}
              >
                <User size={16} />
                Player
              </button>
              <div className="relative">
                <button
                  onClick={() => isDrawingAllowed && setCurrentMode('draw')}
                  onMouseEnter={() => setShowLockTooltip(true)}
                  onMouseLeave={() => setShowLockTooltip(false)}
                  className={`px-4 py-2 rounded font-pixel flex items-center gap-2 ${
                    !isDrawingAllowed ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    currentMode === 'draw'
                      ? 'bg-[#87a985] text-[#e6d9bd] border-2 border-[#6f8b6e]'
                      : 'bg-[#e6d9bd] text-[#937b6a] border-2 border-[#937b6a]'
                  }`}
                  disabled={!isDrawingAllowed}
                >
                  {isDrawingAllowed ? <Paintbrush size={16} /> : <Lock size={16} />}
                  Draw
                </button>
                {showLockTooltip && !isDrawingAllowed && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-[#937b6a] text-[#e6d9bd] rounded font-pixel text-sm whitespace-nowrap z-10">
                    Unlock after victory
                  </div>
                )}
              </div>
              <button
                onClick={() => setCurrentMode('helper')}
                className={`px-4 py-2 rounded font-pixel flex items-center gap-2 ${
                  currentMode === 'helper'
                    ? 'bg-[#87a985] text-[#e6d9bd] border-2 border-[#6f8b6e]'
                    : 'bg-[#e6d9bd] text-[#937b6a] border-2 border-[#937b6a]'
                }`}
              >
                <Target size={16} />
                Helper
              </button>
            </div>

            <button
              onClick={toggleHelperVisibility}
              className="px-4 py-2 rounded font-pixel flex items-center gap-2 bg-[#e6d9bd] text-[#937b6a] border-2 border-[#937b6a]"
            >
              {showHelpers ? <EyeOff size={16} /> : <Eye size={16} />}
              {showHelpers ? 'Hide Notes' : 'Show Notes'}
            </button>
          </div>

          {shouldShowPalette() && (
            <div className="mt-4 pt-4 border-t-2 border-[#937b6a]">
              <ColorPalette
                selectedColor={selectedColor}
                onColorSelect={setSelectedColor}
                isEraser={isEraser}
                setIsEraser={setIsEraser}
                showDrawingTools={shouldShowDrawingTools()}
              />
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-[1200px] mx-auto px-6">
        <div className="bg-[#e6d9bd] p-4 rounded-lg border-4 border-[#937b6a] shadow-[4px_4px_0px_#937b6a] w-full h-[600px] overflow-hidden">
          <div 
            className="game-grid-container relative w-full h-full flex items-center justify-center"
            style={{ 
              transform: `scale(${scale})`,
              transformOrigin: 'center'
            }}
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
              {mapData.backgroundLayer.map((row, rowIndex) => 
                row.map((cellColor, colIndex) => {
                  const interactiveTile = mapData.interactiveTiles.find(tile =>
                    tile.position.row === rowIndex && tile.position.col === colIndex
                  );
                  const helperPoint = helperPoints.find(point => 
                    point.position.row === rowIndex && point.position.col === colIndex
                  );
                  
                  const tileId = interactiveTile ? `${rowIndex}-${colIndex}` : null;
                  const isHovered = tileId === hoveredTile;

                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`relative ${
                        currentMode !== 'draw' ? 'hover:brightness-110 cursor-pointer' : ''
                      }`}
                      style={{
                        width: `${CELL_SIZE}px`,
                        height: `${CELL_SIZE}px`,
                        backgroundColor: cellColor,
                      }}
                      onClick={() => {
                        if (interactiveTile && !isPlacingPlayer) {
                          onTriggerPuzzle(interactiveTile);
                        } else {
                          onCellClick(rowIndex, colIndex);
                        }
                      }}
                      onMouseEnter={() => interactiveTile && setHoveredTile(tileId)}
                      onMouseLeave={() => interactiveTile && setHoveredTile(null)}
                    >
                      {/* Background color layer */}
                      {mapData.objectsLayer[rowIndex][colIndex] && (
                        <div
                          className="absolute inset-0"
                          style={{ backgroundColor: mapData.objectsLayer[rowIndex][colIndex] }}
                        />
                      )}

                      {/* Interactive tile effect - now always visible */}
                      {interactiveTile && (
                        <div 
                          className={`absolute inset-0 cursor-pointer transition-all duration-300 ${
                            isHovered ? 'bg-blue-400/20' : ''
                          }`}
                          style={{
                            animation: 'interactive-pulse 2s infinite',
                            boxShadow: isHovered 
                              ? '0 0 4px 2px rgba(59, 130, 246, 0.5), inset 0 0 4px 2px rgba(59, 130, 246, 0.5)'  
                              : '0 0 3px 1px rgba(59, 130, 246, 0.3), inset 0 0 3px 1px rgba(59, 130, 246, 0.3)',
                            pointerEvents: 'none',
                            zIndex: 1
                          }}
                        />
                      )}

                      {/* Helper points layer */}
                      {showHelpers && helperPoint && (
                        <div 
                          className="absolute inset-0 flex items-center justify-center cursor-pointer"
                          style={{ zIndex: 2 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onHelperPointClick(helperPoint);
                          }}
                        >
                          <Star 
                            size={CELL_SIZE}
                            fill={helperPoint.color}
                            stroke="none"  
                            className="transform scale-100"  
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        
        {isDrawingAllowed && (
          <div className="max-w-[1200px] mx-auto px-6 mt-6">
            <div className="flex justify-center gap-4">
              <button onClick={onExportPNG} className="px-6 py-3 bg-[#87a985] text-[#e6d9bd] rounded font-pixel border-2 border-[#6f8b6e] shadow-[2px_2px_0px_#6f8b6e]">
                Export as PNG
              </button>
              <button onClick={onExportJSON} className="px-6 py-3 bg-[#ada387] text-[#e6d9bd] rounded font-pixel border-2 border-[#937b6a] shadow-[2px_2px_0px_#937b6a]">
                Export as JSON
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameStage;