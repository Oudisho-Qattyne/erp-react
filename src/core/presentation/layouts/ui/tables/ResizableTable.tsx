// src/core/presentation/layouts/ui/tables/DataTable.tsx
import React, { useState, useMemo } from 'react';
import { Tb } from './Tb';
import { Tc } from './Tc';
import { useLanguage } from '../../../context/i18n/I18nProvider';
import { useColumnResize } from './hooks/useColumnResize';
import { SortAsc, SortDesc } from 'lucide-react';
import Input from '../inputs/Input';
import { Spinner } from '../state/Spinner';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface ColumnFilter {
  type?: 'text' | 'select' | 'date' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
  debounceMs?: number;
}

export interface ColumnDef<T = any> {
  key: string;
  label: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  filter?: ColumnFilter;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  rowKey?: keyof T;
  // Sorting (controlled)
  sortColumn?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
  // Filtering (controlled)
  filters?: Record<string, string>;
  onFilterChange?: (columnKey: string, value: string) => void;
  // Selection
  selectable?: boolean;
  selectedRows?: (string | number)[];
  onSelectionChange?: (selectedKeys: (string | number)[]) => void;
  // Loading / Empty
  loading?: boolean;
  emptyMessage?: string;
  // Pagination (optional, can be external)
  pagination?: {
    page: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    itemsPerPage?: number;
    onItemsPerPageChange?: (size: number) => void;
    itemsPerPageOptions?: number[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  rowKey = 'id',
  sortColumn,
  sortOrder,
  onSort,
  filters = {},
  onFilterChange,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  loading = false,
  emptyMessage,
  pagination,
}: DataTableProps<T>) {
  const { direction, t } = useLanguage();
  const initialWidths = columns.map(col => col.width || 150);
  const { columnWidths, startResize } = useColumnResize({ initialWidths, minWidth: 60 });
  const totalWidth = columnWidths.reduce((sum, w) => sum + w, 0);

  // ─────────────────────────────────────────────────────────────────────────
  // Selection handlers
  // ─────────────────────────────────────────────────────────────────────────
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectionChange) {
      const allKeys = data.map(row => row[rowKey] as string | number);
      onSelectionChange(e.target.checked ? allKeys : []);
    }
  };

  const handleSelectRow = (row: T, checked: boolean) => {
    if (onSelectionChange) {
      const key = row[rowKey] as string | number;
      const newSelected = checked
        ? [...selectedRows, key]
        : selectedRows.filter(k => k !== key);
      onSelectionChange(newSelected);
    }
  };

  const isAllSelected = data.length > 0 && selectedRows.length === data.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

  // ─────────────────────────────────────────────────────────────────────────
  // Sorting handlers
  // ─────────────────────────────────────────────────────────────────────────
  const handleHeaderClick = (col: ColumnDef<T>) => {
    if (col.sortable && onSort) {
      onSort(col.key);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Filter change with optional debounce
  // ─────────────────────────────────────────────────────────────────────────
  const [debounceTimers, setDebounceTimers] = useState<Record<string, any>>({});

  const handleFilterInputChange = (colKey: string, value: string, debounceMs?: number) => {
    if (debounceMs && debounceMs > 0) {
      if (debounceTimers[colKey]) clearTimeout(debounceTimers[colKey]);
      const timer = setTimeout(() => {
        onFilterChange?.(colKey, value);
      }, debounceMs);
      setDebounceTimers(prev => ({ ...prev, [colKey]: timer }));
    } else {
      onFilterChange?.(colKey, value);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Pagination helpers
  // ─────────────────────────────────────────────────────────────────────────
  const renderPagination = () => {
    if (!pagination) return null;
    const {
      page,
      totalPages,
      totalItems,
      onPageChange,
      itemsPerPage,
      onItemsPerPageChange,
      itemsPerPageOptions = [5, 10, 20, 50],
    } = pagination;

    return (
      <div className="flex justify-between items-center mt-4 pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">
            {t('pagination.showing', 'shared') || 'عرض'} {data.length} {t('pagination.of', 'shared') || 'من'} {totalItems} {t('pagination.records', 'shared') || 'سجل'}
          </span>
          {onItemsPerPageChange && (
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 rounded border border-border text-sm"
            >
              {itemsPerPageOptions.map((size) => (
                <option key={size} value={size}>
                  {size} / {t('pagination.page', 'shared') || 'صفحة'}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 rounded border border-border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
          >
            {t('pagination.previous', 'shared') || 'السابق'}
          </button>
          <span className="text-sm">
            {t('pagination.page', 'shared') || 'صفحة'} {page} {t('pagination.of', 'shared') || 'من'} {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 rounded border border-border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
          >
            {t('pagination.next', 'shared') || 'التالي'}
          </button>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  const hasFilterRow = columns.some(col => col.filterable);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg shadow-sm border border-border animate-slide-up max-h-[calc(100vh-250px)] overflow-auto">
        <div style={{ minWidth: totalWidth }}>
          <Tb>
            <thead className="sticky top-0 z-30 bg-card">
              {/* Main header row */}
              <tr className="bg-primary-light/10 border-b border-border">
                {selectable && (
                  <th className="py-3 px-2 w-10">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={handleSelectAll}
                      className="rounded border-border"
                    />
                  </th>
                )}
                {columns.map((col, idx) => (
                  <th
                    key={col.key}
                    onClick={() => handleHeaderClick(col)}
                    className={`py-3 px-4 ${direction === 'rtl' ? 'text-right' : 'text-left'} font-semibold text-sm text-text-muted relative select-none group/th whitespace-nowrap border-border/30 ${direction === 'rtl' ? 'border-l' : 'border-r'} ${col.sortable ? 'cursor-pointer hover:bg-primary/5' : ''} ${col.className || ''}`}
                    style={{ width: `${columnWidths[idx]}px`, minWidth: `${columnWidths[idx]}px` }}
                  >
                    <div className="flex items-center justify-between gap-1">
                      {col.label}
                      {col.sortable && sortColumn === col.key && (
                        <span className="text-xs">{sortOrder === 'asc' ? <SortAsc className=' p-1 '/> : <SortDesc className=' p-1 '/>}</span>
                      )}
                      {col.sortable && sortColumn !== col.key && (
                        <span className=' p-1 '>↕</span>
                      )}
                    </div>
                    {/* Resize handle */}
                    {idx !== columns.length - 1 && (
                      <div
                        className={`absolute top-0 ${direction === 'rtl' ? 'left-0' : 'right-0'} h-full w-1.5 cursor-col-resize z-20 transition-all duration-200 hover:bg-primary/30 group-hover/th:bg-border/50`}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          startResize(idx, e.clientX, columnWidths[idx], direction);
                        }}
                      >
                        <div className={`absolute ${direction === 'rtl' ? 'left-0' : 'right-0'} top-1/4 bottom-1/4 w-px bg-border group-hover/th:bg-primary/50`} />
                      </div>
                    )}
                  </th>
                ))}
              </tr>

              {/* Filter row */}
              {hasFilterRow && (
                <tr className="bg-card border-b border-border">
                  {selectable && <td className="py-2 px-2" />}
                  {columns.map((col) => (
                    <td key={`filter-${col.key}`} className="py-2 px-4">
                      {col.filterable && onFilterChange && (
                        col.filter?.type === 'select' ? (
                          <select
                            value={filters[col.key] || ''}
                            onChange={(e) => onFilterChange(col.key, e.target.value)}
                            className="w-full px-2 py-1 text-xs rounded border border-border bg-background"
                          >
                            <option value="">{col.filter.placeholder || t('common.all', 'shared') || 'الكل'}</option>
                            {col.filter.options?.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            type={col.filter?.type === 'number' ? 'number' : 'text'}
                            value={filters[col.key] || ''}
                            onChange={(val) => handleFilterInputChange(
                              col.key,
                              val as string,
                              col.filter?.debounceMs
                            )}
                            placeholder={col.filter?.placeholder || t('common.filter', 'shared') || 'بحث...'}
                            className="w-full text-xs"
                          />
                        )
                      )}
                    </td>
                  ))}
                </tr>
              )}
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-8 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <Spinner size="md" />
                      <span>{t('common.loading', 'shared') || 'جاري التحميل...'}</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-8 text-center text-text-muted">
                    {emptyMessage || t('common.no_data', 'shared') || 'لا توجد بيانات'}
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => {
                  const rowKeyValue = row[rowKey] as string | number;
                  const isSelected = selectedRows.includes(rowKeyValue);
                  return (
                    <tr
                      key={rowKeyValue}
                      onClick={() => onRowClick?.(row)}
                      className={`border-b border-border hover:bg-primary-light/10 transition-all duration-300 ${onRowClick ? 'cursor-pointer' : ''}`}
                      style={{ animationDelay: `${rowIndex * 30}ms` }}
                    >
                      {selectable && (
                        <td className="py-2 px-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(row, e.target.checked)}
                            className="rounded border-border"
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <Tc
                          key={`${rowKeyValue}-${col.key}`}
                          align={col.align || (direction === 'rtl' ? 'right' : 'left')}
                        >
                          {col.render ? col.render(row) : row[col.key]}
                        </Tc>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </Tb>
        </div>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
}