'use client';

import { useState } from 'react';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
}

interface LayerControlProps {
  layers: Layer[];
  onLayerToggle: (layerId: string) => void;
}

export default function LayerControl({ layers, onLayerToggle }: LayerControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center text-lg"
        title="레이어"
      >
        📂
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded shadow-lg min-w-[200px]">
          <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-700 font-semibold text-sm">
            레이어
          </div>
          <div className="py-2">
            {layers.map((layer) => (
              <label
                key={layer.id}
                className="flex items-center px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={layer.visible}
                  onChange={() => onLayerToggle(layer.id)}
                  className="mr-3 w-4 h-4"
                />
                <span className="text-sm">{layer.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
