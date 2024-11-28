import type { MapData, HelperPoint } from '@/types';

export interface FinishedMapResponse {
    mapData: MapData;
    helperPoints: HelperPoint[]; 
    gameProgress: {
      solvedPuzzles: Record<string, boolean>;
      recoveredAreas: Record<string, boolean>;
      solvedHiddenTests: Record<string, number[]>; 
    };
    playerPosition: {
      rowIndex: number;
      colIndex: number;
    };
}
  
  export async function loadDefaultFinishedMap(): Promise<FinishedMapResponse> {
    try {
      const response = await fetch('/fmaps/tree-hw-finished.json');
      if (!response.ok) {
        throw new Error('Failed to load default map');
      }
      const data: FinishedMapResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error loading default map:', error);
      throw error;
    }
  }