'use client';

import { useState, useEffect } from 'react';

interface FullscreenControlProps {
  onToggle: () => void;
}

export default function FullscreenControl({ onToggle }: FullscreenControlProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleClick = () => {
    setIsFullscreen(!isFullscreen);
    onToggle();
  };

  return (
    <button
      onClick={handleClick}
      className="w-10 h-10 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center text-lg"
      title={isFullscreen ? '전체화면 종료' : '전체화면'}
    >
      {isFullscreen ? '⛶' : '⛶'}
    </button>
  );
}
