'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GameSession from '@/components/game/GameSession';
import { MapData } from '@/types';
import { use } from 'react';

export default function GamePage({ params }: { params: Promise<{ mapId: string }> }) {
  const resolvedParams = use(params);
  const [mapData, setMapData] = useState<MapData | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const mapId = resolvedParams.mapId;

  useEffect(() => {
    let mounted = true;

    const loadMap = async () => {
      if (!mounted) return;
      
      try {
        setLoading(true);
        
        if (mapId.startsWith('custom-')) {
          const storedMap = localStorage.getItem(`map_${mapId}`);
          if (storedMap && mounted) {
            setMapData(JSON.parse(storedMap));
          } else {
            if (mounted) setError('Custom map not found');
          }
        } else {
          // Load map from public/maps directory
          const response = await fetch(`/maps/${mapId}.json`);
          if (!response.ok) throw new Error('Map not found');
          const data = await response.json();
          if (mounted) setMapData(data);
        }
      } catch (err) {  
        if (mounted) setError(`Failed to load map: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadMap();
    return () => { mounted = false; };
  }, [mapId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eee1c4] flex items-center justify-center">
        <div className="bg-[#e6d9bd] p-6 rounded-lg border-4 border-[#937b6a] shadow-[4px_4px_0px_#937b6a]">
          <p className="text-2xl font-pixel text-[#937b6a]">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error || !mapData) {
    return (
      <div className="min-h-screen bg-[#eee1c4] flex flex-col items-center justify-center gap-4">
        <div className="bg-[#e6d9bd] p-6 rounded-lg border-4 border-[#937b6a] shadow-[4px_4px_0px_#937b6a]">
          <p className="text-2xl font-pixel text-[#937b6a]">{error || 'Map not found'}</p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-[#87a985] text-[#e6d9bd] rounded font-pixel
                    border-4 border-[#6f8b6e] shadow-[4px_4px_0px_#6f8b6e]"
        >
          Return Home
        </button>
      </div>
    );
  }

  return <GameSession mapId={mapId} mapData={mapData} />;
}