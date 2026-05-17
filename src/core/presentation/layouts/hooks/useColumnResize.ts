import { useState, useRef, useCallback, useEffect } from 'react';

interface UseColumnResizeOptions {
  initialWidths?: number[];
  minWidth?: number;
}

export function useColumnResize({ initialWidths = [], minWidth = 60 }: UseColumnResizeOptions = {}) {
  const [columnWidths, setColumnWidths] = useState<number[]>(initialWidths);
  const resizingRef = useRef({
    active: false,
    columnIndex: -1,
    startX: 0,
    startWidth: 0,
    direction: 'rtl', // default
  });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizingRef.current.active) return;
    const { columnIndex, startX, startWidth, direction } = resizingRef.current;
    
    // In RTL: moving left (decreasing clientX) increases width
    // In LTR: moving right (increasing clientX) increases width
    const delta = direction === 'rtl' ? (startX - e.clientX) : (e.clientX - startX);
    
    const newWidth = Math.max(minWidth, startWidth + delta);
    setColumnWidths(prev => {
      const updated = [...prev];
      updated[columnIndex] = newWidth;
      return updated;
    });
  }, [minWidth]);

  const handleMouseUp = useCallback(() => {
    resizingRef.current.active = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const startResize = (columnIndex: number, startX: number, startWidth: number, direction: string = 'rtl') => {
    resizingRef.current = {
      active: true,
      columnIndex,
      startX,
      startWidth,
      direction,
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return {
    columnWidths,
    setColumnWidths,
    startResize,
  };
}