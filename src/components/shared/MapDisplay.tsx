import React, { useState, useEffect, useRef } from 'react';
import { MapData } from '@/types';

interface MapDisplayProps {
  mapData: MapData;
  className?: string;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ mapData, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 15});
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current || !mapData?.backgroundLayer) return;
      
      const COLS = mapData.backgroundLayer[0].length;
      const ROWS = mapData.backgroundLayer.length;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const scaleX = containerRect.width / COLS;
      const scaleY = containerRect.height / ROWS;
      setScale(Math.min(scaleX, scaleY));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [mapData]);

  if (!mapData?.backgroundLayer) {
    return <div className="w-full h-full flex items-center justify-center text-[#937b6a] font-pixel">
      Loading map...
    </div>;
  }

  const COLS = mapData.backgroundLayer[0].length;

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
      ref={containerRef}
      className={`w-full h-full absolute overflow-hidden bg-transparent ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        className="absolute cursor-grab"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, ${Math.max(2, scale)}px)`,
          gap: '0px',
          transform: `translate(${position.x}px, ${position.y}px)`,
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
                width: `${Math.max(2, scale)}px`,
                height: `${Math.max(2, scale)}px`,
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