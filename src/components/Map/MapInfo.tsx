'use client';

interface MapInfoProps {
  coordinates: [number, number] | null;
  zoom: number;
}

export default function MapInfo({ coordinates, zoom }: MapInfoProps) {
  return (
    <div className="absolute bottom-4 right-4 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded shadow-md px-4 py-2 z-10 font-mono text-sm">
      <div className="flex flex-col gap-1">
        <div>
          <span className="text-zinc-600 dark:text-zinc-400">좌표: </span>
          <span className="font-semibold">
            {coordinates
              ? `${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}`
              : 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-zinc-600 dark:text-zinc-400">줌: </span>
          <span className="font-semibold">{zoom.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
