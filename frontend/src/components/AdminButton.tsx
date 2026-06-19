"use client";

import { useState } from 'react';

interface AdminButtonProps {
  onClick: () => void;
  className?: string;
}

export function AdminButton({ onClick, className = '' }: AdminButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 transition-all duration-200 ${className}`}
    >
      <span className="text-lg">⚙️</span>
      <span className="text-sm font-medium text-amber-400">Admin</span>
      {isHovered && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-amber-900/90 text-amber-100 text-xs px-2 py-1 rounded whitespace-nowrap z-10">
          Click 5 times on "7 Secciones" to unlock
        </div>
      )}
    </button>
  );
}