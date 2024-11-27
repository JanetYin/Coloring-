import React, { useState } from 'react';
import { MapData } from '@/types';

interface MapDisplayProps {
  mapData: MapData;
  className?: string;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ mapData, className = '' }) => {
  const [position, setPosition] = useState({ x: -40, y: 0 }); // Initial offset from top-left
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!mapData?.backgroundLayer) {
    return <div className="w-full h-full flex items-center justify-center text-[#937b6a] font-pixel">
      Loading map...
    </div>;
  }

  const COLS = mapData.backgroundLayer[0].length;
  const ROWS = mapData.backgroundLayer.length;
  const containerWidth = 1080;
  const containerHeight = 460;
  const scaleX = containerWidth / COLS;
  const scaleY = containerHeight / ROWS;
  const scale = Math.min(scaleX, scaleY);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ 
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="w-full h-full absolute overflow-hidden bg-transparent"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        className="grid absolute cursor-grab"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1px)`,
          gap: '0px',
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'top left',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        {mapData.backgroundLayer.map((row, rowIndex) => 
          row.map((cellColor, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="relative"
              style={{
                width: '1px',
                height: '1px',
                backgroundColor: cellColor,
              }}
            >
              {mapData.objectsLayer[rowIndex][colIndex] && (
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: mapData.objectsLayer[rowIndex][colIndex] }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MapDisplay;