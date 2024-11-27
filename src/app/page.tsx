
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Pixelify_Sans } from 'next/font/google';
import RetroMapEditor from '@/components/editor/RetroMapEditor';
import ColorPalette, { defaultColors } from '@/components/shared/ColorPalette';
import PlayerEditor from '@/components/editor/PlayerEditor';
import MapSelection from '@/components/editor/MapSelection';
import { EditorMode, MapData } from '@/types';
import MapDisplay from '@/components/shared/MapDisplay';
import { FinishedMapResponse ,loadDefaultFinishedMap } from '@/lib/defaultFinishedMap';

const pixelifySans = Pixelify_Sans({ subsets: ['latin'], weight: ['400', '500', '700'] });

const NavigationBar = ({ currentMode, setCurrentMode }: { currentMode: EditorMode, setCurrentMode: (mode: EditorMode) => void }) => {
  if (currentMode === 'home') return null;
  
  return (
    <div className="w-full bg-[#e6d9bd] border-b-4 border-[#937b6a] px-8 py-4">
      <h2 
        onClick={() => setCurrentMode('home')}
        className={`${pixelifySans.className} text-3xl text-[#87a985] cursor-pointer hover:text-[#6f8b6e] transition-colors w-fit`}
      >
        Coloring!
      </h2>
    </div>
  );
};


export default function Home() {
  const [currentMode, setCurrentMode] = useState<EditorMode>('home');
  const [selectedColor, setSelectedColor] = useState(defaultColors[0]);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [isEraser, setIsEraser] = useState(false);
  const [displayMap, setDisplayMap] = useState<MapData | null>(null);


  useEffect(() => {
    loadDefaultFinishedMap()
      .then((data: FinishedMapResponse) => {
        setDisplayMap(data.mapData);
      })
      .catch(console.error);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMapUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      setDisplayMap(data.mapData || data);
    } catch (error) {
      console.error('Error loading map:', error);
    }
  };


  const router = useRouter();
  

  const handleMapSelect = (mapId: string, mapData?: MapData) => {
    setSelectedMapId(mapId);
    if (mapData) {
      localStorage.setItem(`map_${mapId}`, JSON.stringify(mapData));
    }
  };

  const handleStart = () => {
    if (!selectedMapId) {
      alert('Please select a map before starting');
      return;
    }
    router.push(`/game/${selectedMapId}`);
  };

  const renderColoringMode = () => (
    <div className="space-y-6 w-full max-w-[1080px]">
      <div className="bg-[#e6d9bd] p-6 rounded-lg border-4 border-[#937b6a] shadow-[4px_4px_0px_#937b6a]">
        <ColorPalette
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
          isEraser={isEraser}
          setIsEraser={setIsEraser}
        />
      </div>

      <div className="bg-[#e6d9bd] rounded-lg border-4 border-[#937b6a] shadow-[8px_8px_0px_#937b6a] overflow-hidden">
        <div className="h-[600px] grid grid-cols-2">
          <div className="border-r-4 border-[#937b6a] p-8">
            <PlayerEditor 
              selectedColor={selectedColor} 
              isEraser={isEraser}
            />
          </div>

          <div className="p-8 flex flex-col">
            <MapSelection
              selectedMapId={selectedMapId}
              onSelectMap={handleMapSelect}
            />
            
            <div className="mt-auto">
              <button
                onClick={handleStart}
                disabled={!selectedMapId}
                className={`w-full py-4 px-8 rounded-lg text-[#e6d9bd] text-lg font-pixel transition-colors
                  ${selectedMapId
                    ? 'bg-[#87a985] hover:bg-[#6f8b6e] border-4 border-[#6f8b6e] shadow-[4px_4px_0px_#6f8b6e]'
                    : 'bg-[#a0a0a0] cursor-not-allowed border-4 border-[#838383]'
                  }`}
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#eee1c4] flex flex-col">
      <NavigationBar currentMode={currentMode} setCurrentMode={setCurrentMode} />
      
      <div className="flex-1 flex flex-col items-center py-12">
        {currentMode === 'home' && (
          <>
            <h1 className={`${pixelifySans.className} text-8xl text-[#87a985] mb-16 tracking-wider`}>
              Coloring!
            </h1>
            <div className="bg-[#e6d9bd] p-8 rounded-lg border-4 border-[#937b6a] shadow-[8px_8px_0px_#937b6a] w-full max-w-[1080px]">
            <div className="bg-[#d4c5a9] rounded-lg border-2 border-[#937b6a] h-[460px] mb-8 relative overflow-hidden">
                {displayMap && (
                  <MapDisplay mapData={displayMap} />
                )}
                <div className="bg-[#d4c5a9] rounded-lg border-2 border-[#937b6a] h-[460px] mb-8 relative overflow-hidden">
                  {displayMap && (
                    <MapDisplay mapData={displayMap} />
                  )}
                  <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`${pixelifySans.className} px-6 py-3 bg-transparent text-[#6f8b6e] rounded-lg text-xl
                                  border-4 border-[#6f8b6e] shadow-[4px_4px_0px_#6f8b6e]
                                  hover:bg-[#6f8b6e] hover:text-[#e6d9bd] transition-all duration-200`}
                    >
                      Your Adventure Awaits!
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleMapUpload}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-8">
                <button
                  onClick={() => setCurrentMode('creating')}
                  className="px-10 py-5 bg-[#87a985] text-[#e6d9bd] rounded-lg font-pixel text-2xl
                           border-4 border-[#6f8b6e] shadow-[4px_4px_0px_#6f8b6e] hover:bg-[#6f8b6e]
                           transition-colors"
                >
                  Creating Mode
                </button>
                <button
                  onClick={() => setCurrentMode('coloring')}
                  className="px-10 py-5 bg-[#ada387] text-[#e6d9bd] rounded-lg font-pixel text-2xl
                           border-4 border-[#937b6a] shadow-[4px_4px_0px_#937b6a] hover:bg-[#937b6a]
                           transition-colors"
                >
                  Coloring Mode
                </button>
              </div>
            </div>
          </>
        )}

        {currentMode === 'coloring' && renderColoringMode()}
        {currentMode === 'creating' && (
          <div className="w-full max-w-[1080px]">
            <RetroMapEditor />
          </div>
        )}
      </div>
    </div>
  );
}