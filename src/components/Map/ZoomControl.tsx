'use client';

interface ZoomControlProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onHome: () => void;
}

export default function ZoomControl({ onZoomIn, onZoomOut, onHome }: ZoomControlProps) {
  return (
    <>
      <button
        onClick={onZoomIn}
        className="w-10 h-10 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center text-xl font-bold"
        title="줌 인"
      >
        +
      </button>
      <button
        onClick={onZoomOut}
        className="w-10 h-10 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center text-xl font-bold"
        title="줌 아웃"
      >
        −
      </button>
      <button
        onClick={onHome}
        className="w-10 h-10 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center text-sm"
        title="초기 위치로"
      >
        🏠
      </button>
    </>
  );
}
