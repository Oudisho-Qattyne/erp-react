'use client';

import React, { useState, useRef, useCallback } from 'react';

interface ThProps {
  children: React.ReactNode;
  width?: number;
  minWidth?: number;
  onResize?: (width: number) => void;
  className?: string;
}

export function Th({ 
  children, 
  width, 
  minWidth = 50, 
  onResize, 
  className = '' 
}: ThProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(width);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startX.current = e.pageX;
    startWidth.current = currentWidth || 0;

    const doResize = (moveEvent: MouseEvent) => {
      const delta = moveEvent.pageX - startX.current;
      const newWidth = Math.max(minWidth, startWidth.current + delta);
      setCurrentWidth(newWidth);
      if (onResize) onResize(newWidth);
    };

    const stopResize = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', doResize);
      window.removeEventListener('mouseup', stopResize);
    };

    window.addEventListener('mousemove', doResize);
    window.addEventListener('mouseup', stopResize);
  }, [currentWidth, minWidth, onResize]);

  return (
    <th
      className={`
        py-3 px-4 text-right font-semibold text-sm text-text-muted 
        border-b border-border relative select-none group
        ${className}
      `}
      style={{ width: currentWidth ? `${currentWidth}px` : 'auto' }}
    >
      <div className="flex items-center justify-between">
        {children}
      </div>
      
      {/* Resize Handle */}
      <div
        onMouseDown={startResize}
        className={`
          absolute top-0 left-0 h-full w-1 cursor-col-resize
          hover:bg-primary transition-colors
          ${isResizing ? 'bg-primary w-0.5' : 'bg-transparent'}
        `}
      />
    </th>
  );
}
