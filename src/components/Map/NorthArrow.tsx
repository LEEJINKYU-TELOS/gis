'use client';

interface NorthArrowProps {
  rotation: number;
}

export default function NorthArrow({ rotation }: NorthArrowProps) {
  return (
    <div className="w-10 h-10 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full shadow-md flex items-center justify-center">
      <div
        className="text-2xl transition-transform duration-300"
        style={{ transform: `rotate(${-rotation}rad)` }}
      >
        ⬆
      </div>
    </div>
  );
}
