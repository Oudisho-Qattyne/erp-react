// src/components/ui/ResizableTable.tsx
'use client';

import React from 'react';
import { Tb } from './Tb';
import { Tc } from './Tc';
import { useColumnResize } from '../../../hooks/useColumnResize';
import { useLanguage } from '../../../context/LanguageContext';

export interface ColumnDef<T = any> {
  key: string;
  label: string;
  width?: number;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface ResizableTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  rowKey?: keyof T;
}


export function ResizableTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  rowKey = 'id' as keyof T,
}: ResizableTableProps<T>) {
  const { direction, t } = useLanguage();
  const initialWidths = columns.map(col => col.width || 150);
  const { columnWidths, startResize } = useColumnResize({ initialWidths, minWidth: 60 });

  // Calculate total table width to prevent other columns from shrinking
  const totalWidth = columnWidths.reduce((sum, w) => sum + w, 0);

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border animate-slide-up max-h-[600px] overflow-auto">
      <div style={{ minWidth: totalWidth }}>
        <Tb>
          <thead className="sticky top-0 z-30 bg-card">
            <tr className="bg-primary-light/10 border-b border-border">
              {columns.map((col, idx) => (
                <th
                  key={col.key}
                  className={`py-3 px-4 ${direction === 'rtl' ? 'text-right' : 'text-left'} font-semibold text-sm text-text-muted relative select-none group/th whitespace-nowrap border-border/30 ${direction === 'rtl' ? 'border-l' : 'border-r'}`}
                  style={{ width: `${columnWidths[idx]}px`, minWidth: `${columnWidths[idx]}px` }}
                >
                  {col.label}
                  {/* Resize handle: only between columns */}
                  {idx !== columns.length - 1 && (
                    <div
                      className={`absolute top-0 ${direction === 'rtl' ? 'left-0' : 'right-0'} h-full w-1.5 cursor-col-resize z-20 transition-all duration-200 hover:bg-primary/30 group-hover/th:bg-border/50`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        startResize(idx, e.clientX, columnWidths[idx], direction);
                      }}
                    >
                      <div className={`absolute ${direction === 'rtl' ? 'left-0' : 'right-0'} top-1/4 bottom-1/4 w-[1px] bg-border group-hover/th:bg-primary/50`} />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-text-muted">
                  {t('common.no_data', 'shared') !== 'common.no_data' ? t('common.no_data', 'shared') : 'لا توجد بيانات حالياً'}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row[rowKey] as string}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-border hover:bg-primary-light/10 transition-all duration-300 group `}
                  style={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    animationDelay: `${rowIndex * 50}ms`
                  }}
                >
                  {columns.map((col) => (
                    <Tc
                      key={`${row[rowKey] as string}-${col.key}`}
                      align={col.align || (direction === 'rtl' ? 'right' : 'left')}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </Tc>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </Tb>
      </div>
    </div>
  );
}