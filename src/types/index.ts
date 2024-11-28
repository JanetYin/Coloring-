// Editor and Navigation Types
export type EditorMode = 'home' | 'coloring' | 'creating';
export type ColoringStep = 'player' | 'map' | 'game';
export type MapEditorMode = 'background' | 'objects' | 'interactive';

// Basic Types
interface Position {
  x: number;
  y: number;
  row?: number;
  col?: number;
}

export interface GameProgress {
  solvedPuzzles: Set<string>;
  recoveredAreas: Set<string>;
  solvedHiddenTests: Record<string, Set<number>>;
}

export interface HelperNote {
  title: string;
  content: string;
}

export interface HelperPoint {
  id: string;
  position: {
    row: number;
    col: number;
  };
  color: string;
  note?: HelperNote;
}
export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface PuzzleInfo {
  description: string;
  hints: string[];
  testCases: TestCase[];
  
}


export interface RecoveryArea {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface InteractiveTile {
  position: Position;
  type: 'trigger';
  id: string;
  puzzle?: PuzzleInfo;
  recoveryArea?: RecoveryArea;
}

// Map Related Types
export interface MapObject {
  type: 'draw' | 'erase';
  position: Position;
  color: string | null;
}

export interface LayerVisibility {
  background: boolean;
  objects: boolean;
  interactive: boolean;
}

// Combined Map Data Interface
export interface MapData {
  backgroundLayer: string[][];
  objectsLayer: string[][];
  interactiveTiles: InteractiveTile[];
  originalColors?: string[][];
  recoveredAreas?: boolean[][];
  helperPoints?: HelperPoint[]; 
}

// Player Data
export interface PlayerData {
  pixels: string[][];
  timestamp: string;
}

// Game Session Types
export interface GameState {
  playerData: PlayerData | null;
  mapData: MapData | null;
  currentStep: ColoringStep;
}

// Component Props
export interface NavigationProps {
  currentMode: EditorMode;
  setCurrentMode: (mode: EditorMode) => void;
}

export interface HomeCardsProps {
  onModeSelect: (mode: EditorMode) => void;
}

export interface ColorPaletteProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  isEraser: boolean;
  setIsEraser: (isEraser: boolean) => void;
}

export interface MapGridProps {
  width: number;
  height: number;
  cellSize: number;
  backgroundLayer: string[][];
  objectsLayer: string[][];
  interactiveTiles: InteractiveTile[];
  onUpdateLayers: (
    type: 'background' | 'objects' | 'interactive', 
    data: string[][] | InteractiveTile[] 
  ) => void;
}
export interface SavedGameState {
  recoveredColors: {
    backgroundLayer: string[][];
    objectsLayer: string[][];
  };
  helperPoints: HelperPoint[];
  gameProgress: {
    solvedPuzzles: string[];
    recoveredAreas: string[];
    solvedHiddenTests: Record<string, number[]>;
  };
  lastPlayerPosition: { rowIndex: number; colIndex: number; } | null;
}


export interface GameSessionProps {
  playerData: PlayerData;
  mapData: MapData;
  onExit: () => void;
}
export interface GameStageProps {
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
}