// lib/defaultFinishedMap.ts
import type { MapData } from '@/types';


export interface FinishedMapResponse {
    mapData: MapData;
    helperPoints: any[];
    gameProgress: {
      solvedPuzzles: Record<string, any>;
      recoveredAreas: Record<string, any>;
      solvedHiddenTests: Record<string, any>;
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