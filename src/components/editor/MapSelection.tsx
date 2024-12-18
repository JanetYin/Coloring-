import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import type { MapData } from '@/types';
import { defaultMaps } from '@/lib/maps';

interface CustomMap {
  id: string;
  name: string;
  description: string;
  icon: string;
  data: MapData;
  timestamp: number;
}

interface MapSelectionProps {
  selectedMapId: string | null;
  onSelectMap: (mapId: string, mapData?: MapData) => void;
}

const MapSelection: React.FC<MapSelectionProps> = ({ onSelectMap, selectedMapId }) => {
  const [customMaps, setCustomMaps] = useState<CustomMap[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearOldMaps = useCallback(() => {
    try {
      const maps = [...customMaps].sort((a, b) => b.timestamp - a.timestamp);
      if (maps.length > 5) {
        const mapsToRemove = maps.slice(5);
        mapsToRemove.forEach(map => {
          localStorage.removeItem(`map_${map.id}`);
        });
        setCustomMaps(maps.slice(0, 5));
      }
    } catch (error) {
      console.warn('Error cleaning up old maps:', error instanceof Error ? error.message : 'Unknown error');
    }
  }, [customMaps]);

  useEffect(() => {
    const loadCustomMaps = () => {
      const storedMaps = localStorage.getItem('customMaps');
      if (storedMaps) {
        try {
          const parsedMaps = JSON.parse(storedMaps);
          setCustomMaps(parsedMaps);
        } catch (error) {
          console.error('Error loading maps:', error instanceof Error ? error.message : 'Unknown error');
        }
      }
    };

    loadCustomMaps();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('customMaps', JSON.stringify(customMaps));
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        clearOldMaps();
      }
    }
  }, [customMaps, clearOldMaps]); 
  

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (customMaps.length >= 5) {
        clearOldMaps();
      }

      const text = await file.text();
      const mapData: MapData = JSON.parse(text);
      
      const newCustomMap: CustomMap = {
        id: `custom-${Date.now()}`,
        name: file.name.replace('.json', ''),
        description: 'Custom uploaded map',
        icon: '📍',
        data: mapData,
        timestamp: Date.now()
      };

      try {
        localStorage.setItem(`map_${newCustomMap.id}`, JSON.stringify(mapData));
      } catch (error) {
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          clearOldMaps();
          localStorage.setItem(`map_${newCustomMap.id}`, JSON.stringify(mapData));
        } else {
          throw error;
        }
      }
      
      setCustomMaps(prev => [...prev, newCustomMap]);
      
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-[#87a985] text-[#e6d9bd] px-4 py-2 rounded-lg font-pixel z-50 transition-opacity duration-500';
      notification.textContent = 'Map uploaded successfully!';
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => document.body.removeChild(notification), 500);
      }, 2000);
    } catch (error) {
      console.error('Error loading map:', error instanceof Error ? error.message : 'Unknown error');
      alert('Failed to load map. Please try clearing some space or removing old maps.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeCustomMap = (mapId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setCustomMaps(prev => prev.filter(map => map.id !== mapId));
    localStorage.removeItem(`map_${mapId}`);
    if (selectedMapId === mapId) {
      onSelectMap('');
    }
  };

  const handleMapSelect = async (mapId: string, customMap?: CustomMap) => {
    if (customMap) {
      onSelectMap(mapId, customMap.data);
    } else {
      try {
        const response = await fetch(`/maps/${mapId}.json`);
        if (!response.ok) throw new Error('Map not found');
        const mapData = await response.json();
        onSelectMap(mapId, mapData);
      } catch (error) {
        console.error('Error loading map:', error instanceof Error ? error.message : 'Unknown error');
        alert('Failed to load map');
      }
    }
  };



  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-pixel text-[#937b6a]">Select Map</h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-[#87a985] text-[#e6d9bd] rounded font-pixel
                    border-2 border-[#6f8b6e] shadow-[2px_2px_0px_#6f8b6e]
                    hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#6f8b6e]
                    transition-all duration-200 flex items-center gap-2"
        >
          <Upload size={16} />
          Upload Map
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
      
      <div className="flex-grow overflow-auto custom-scrollbar pr-2">
        <div className="space-y-4">
          {/* Default Maps */}
          <div className="mb-6">
            <h3 className="font-pixel text-[#937b6a] mb-3">Default Maps</h3>
            {defaultMaps.map((map) => (
              <div
                key={map.id}
                className={`group w-full transition-all duration-200 relative mb-4 ${
                  selectedMapId === map.id
                    ? 'transform translate-x-1 translate-y-1'
                    : 'hover:translate-x-1 hover:translate-y-1'
                }`}
                role="button"
                onClick={() => handleMapSelect(map.id)}
              >
                <div className={`w-full p-4 rounded-lg text-left relative z-10 border-4 
                  ${selectedMapId === map.id
                    ? 'bg-[#87a985] border-[#6f8b6e] shadow-[4px_4px_0px_#6f8b6e]'
                    : 'bg-[#e6d9bd] border-[#937b6a] shadow-[8px_8px_0px_#937b6a] group-hover:shadow-[4px_4px_0px_#937b6a]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{map.icon}</div>
                    <div>
                      <h3 className={`font-pixel text-lg mb-1 ${
                        selectedMapId === map.id ? 'text-[#e6d9bd]' : 'text-[#937b6a]'
                      }`}>
                        {map.name}
                      </h3>
                      <p className={`font-pixel text-sm ${
                        selectedMapId === map.id ? 'text-[#dbcfb1]' : 'text-[#a97e5c]'
                      }`}>
                        {map.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Maps */}
          {customMaps.length > 0 && (
            <div>
              <h3 className="font-pixel text-[#937b6a] mb-3">Custom Maps</h3>
              {customMaps.map((map) => (
                <div
                  key={map.id}
                  className={`group w-full transition-all duration-200 relative mb-4 ${
                    selectedMapId === map.id
                      ? 'transform translate-x-1 translate-y-1'
                      : 'hover:translate-x-1 hover:translate-y-1'
                  }`}
                  role="button"
                  onClick={() => handleMapSelect(map.id, map)}
                >
                  <div className={`w-full p-4 rounded-lg text-left relative z-10 border-4 
                    ${selectedMapId === map.id
                      ? 'bg-[#87a985] border-[#6f8b6e] shadow-[4px_4px_0px_#6f8b6e]'
                      : 'bg-[#e6d9bd] border-[#937b6a] shadow-[8px_8px_0px_#937b6a] group-hover:shadow-[4px_4px_0px_#937b6a]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{map.icon}</div>
                      <div className="flex-grow">
                        <h3 className={`font-pixel text-lg mb-1 ${
                          selectedMapId === map.id ? 'text-[#e6d9bd]' : 'text-[#937b6a]'
                        }`}>
                          {map.name}
                        </h3>
                        <p className={`font-pixel text-sm ${
                          selectedMapId === map.id ? 'text-[#dbcfb1]' : 'text-[#a97e5c]'
                        }`}>
                          {map.description}
                        </p>
                      </div>
                      <div
                        onClick={(e) => removeCustomMap(map.id, e)}
                        className="p-1 hover:bg-red-100 rounded absolute top-2 right-2 cursor-pointer"
                      >
                        <X size={16} className="text-red-500" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapSelection;