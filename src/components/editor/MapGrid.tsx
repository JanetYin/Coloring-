// // components/editor/MapGrid.tsx

// import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
// import type { LayerType, LayerVisibility, MapData } from '@/types';

// interface MapGridProps {
//   width: number;
//   height: number;
//   cellSize: number;
//   activeLayer: LayerType;
//   layerVisibility: LayerVisibility;
//   selectedTool: string;
//   selectedColor: string;
//   isEraser: boolean;
//   mapData: MapData;
//   setMapData: React.Dispatch<React.SetStateAction<MapData>>;
// }

// export interface MapGridRef {
//   exportMapData: () => {
//     dimensions: {
//       width: number;
//       height: number;
//       cellSize: number;
//     };
//     mapData: MapData;
//   };
//   clearLayer: (layer: LayerType) => void;
// }

// const MapGrid = forwardRef<MapGridRef, MapGridProps>((props, ref) => {
//   const {
//     width,
//     height,
//     cellSize,
//     activeLayer,
//     layerVisibility,
//     selectedColor,
//     isEraser,
//     mapData,
//     setMapData
//   } = props;

//   const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
//   const objectsCanvasRef = useRef<HTMLCanvasElement>(null);
//   const puzzleCanvasRef = useRef<HTMLCanvasElement>(null);
//   const isDrawingRef = useRef(false);

//   useImperativeHandle(ref, () => ({
//     exportMapData: () => ({
//       dimensions: { width, height, cellSize },
//       mapData
//     }),
//     clearLayer: (layer) => {
//       const canvas = getCanvasRef(layer)?.current;
//       if (canvas) {
//         const ctx = canvas.getContext('2d');
//         ctx?.clearRect(0, 0, width, height);
//         setMapData(prev => ({
//           ...prev,
//           [layer]: {
//             ...prev[layer],
//             elements: []
//           }
//         }));
//       }
//     }
//   }));

//   const getCanvasRef = (layer: LayerType) => {
//     switch (layer) {
//       case 'background': return backgroundCanvasRef;
//       case 'objects': return objectsCanvasRef;
//       case 'puzzle': return puzzleCanvasRef;
//       default: return null;
//     }
//   };

//   const handleDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
//     const canvas = getCanvasRef(activeLayer)?.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     const rect = canvas.getBoundingClientRect();
//     const x = Math.floor((e.clientX - rect.left) / cellSize) * cellSize;
//     const y = Math.floor((e.clientY - rect.top) / cellSize) * cellSize;

//     if (isEraser) {
//       ctx.clearRect(x, y, cellSize, cellSize);
//     } else {
//       ctx.fillStyle = selectedColor;
//       ctx.fillRect(x, y, cellSize, cellSize);
//     }

//     setMapData(prev => ({
//       ...prev,
//       [activeLayer]: {
//         ...prev[activeLayer],
//         elements: [...prev[activeLayer].elements, {
//           type: isEraser ? 'erase' : 'draw',
//           position: { x, y },
//           color: isEraser ? null : selectedColor
//         }]
//       }
//     }));
//   };

//   useEffect(() => {
//     [backgroundCanvasRef, objectsCanvasRef, puzzleCanvasRef].forEach(ref => {
//       if (ref.current) {
//         const ctx = ref.current.getContext('2d');
//         if (ctx) {
//           ctx.imageSmoothingEnabled = false;
//           ref.current.style.imageRendering = 'pixelated';
//         }
//       }
//     });
//   }, []);

//   return (
//     <div className="relative bg-white rounded shadow" style={{ width, height }}>
//       <canvas
//         ref={backgroundCanvasRef}
//         width={width}
//         height={height}
//         className="absolute top-0 left-0"
//         style={{ opacity: layerVisibility.background ? 1 : 0.3 }}
//       />
//       <canvas
//         ref