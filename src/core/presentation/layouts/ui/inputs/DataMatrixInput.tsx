import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../buttons/Button';
import Input, { type InputType } from './Input';
import { HintsInput, type HintRect } from './HintsInput';
import { inputBaseClasses, errorClasses } from './styles';
import { useLanguage } from '../../../context/i18n/I18nProvider';

export interface MatrixFieldConfig {
  name: string;
  label: string;
  type?: InputType;
  required?: boolean;
  disabled?: boolean;
  excludeSelected?: boolean;
  options?: { value: number | string; label: string }[];
  placeholder?: string;
  defaultValue?: any;
  searchable?: boolean;
  decimalPlaces?: number;
  allowNegative?: boolean;
  createTitle?: string;
  renderCreateForm?: (onSuccess: (value: number | string, item?: unknown) => void, onCancel: () => void, dependentData?: Record<string, unknown>) => React.ReactNode;
  labelPath?: string;
  createButtonPermission?: string;
  compute?: (row: Record<string, any>, value: any) => Record<string, any> | void;
  hints?: {
    searchApi: (query: string, dependentData?: Record<string, unknown>) => Promise<Record<string, unknown>[]>;
    minChars?: number;
    debounceMs?: number;
    displayValue?: (item: Record<string, unknown>) => string;
    fill?: (item: Record<string, unknown>) => Record<string, unknown>;
  };
}

interface DataMatrixInputProps {
  value: Record<string, any>[];
  onChange: (rows: Record<string, any>[]) => void;
  matrixFields: MatrixFieldConfig[];
  numberOfRows?: number;
  minRows?: number;
  maxRows?: number;
  disabled?: boolean;
  baseClasses?: string;
  errors?: Record<number, Record<string, string>>;
  rowSchema?: { safeParse: (data: any) => { success: boolean; error?: { flatten: () => { fieldErrors: Record<string, string[]> } } } };
  dependentData?: Record<string, unknown>;
  defaultRowFactory?: () => Record<string, any>;
}

const getDefaultRow = (fields: MatrixFieldConfig[]) => {
  const row: Record<string, any> = {};
  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      row[field.name] = field.defaultValue;
    } else if (field.type === 'number' || field.type === 'numeric' || field.type === 'decimal') {
      row[field.name] = 0;
    } else if (field.type === 'select' || field.type === 'select-or-create') {
      row[field.name] = null;
    } else {
      row[field.name] = '';
    }
  }
  return row;
};

function HintDropList({
  items,
  fields,
  activeIndex,
  onSelect,
  showActionsColumn,
}: {
  items: Record<string, unknown>[];
  fields: MatrixFieldConfig[];
  activeIndex: number;
  onSelect: (item: Record<string, unknown>) => void;
  showActionsColumn: boolean;
}) {
  return (
    <table className="w-full border-collapse table-fixed">
      <tbody>
        {items.map((item, index) => (
          <tr
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
            className={`border-b border-border last:border-b-0 cursor-pointer ${index === activeIndex ? 'bg-primary/10' : 'hover:bg-primary-light/20'}`}
          >
            {fields.map((field) => (
              <td key={field.name} className="px-3 py-2 text-sm text-text align-top">
                <div className="truncate">
                  {String(field.hints?.displayValue ? field.hints.displayValue(item) : item[field.name] ?? '—')}
                </div>
              </td>
            ))}
            {showActionsColumn && <td className="w-10" />}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function DataMatrixInput({
  value = [],
  onChange,
  matrixFields = [],
  numberOfRows,
  minRows = 0,
  maxRows = 100,
  disabled = false,
  baseClasses = '',
  errors: externalErrors = {},
  rowSchema,
  dependentData,
  defaultRowFactory,
}: DataMatrixInputProps) {
  const { t } = useLanguage();
  const tableRef = useRef<HTMLTableElement>(null);
  const defaultRow = useMemo(
    () => (defaultRowFactory ? defaultRowFactory() : getDefaultRow(matrixFields)),
    [matrixFields, defaultRowFactory]
  );
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const dragRef = useRef<{ field: string; startX: number; startWidth: number } | null>(null);
  const rows = numberOfRows !== undefined
    ? Array.from({ length: numberOfRows }, (_, i) => value[i] || { ...defaultRow })
    : value;

  const internalErrors = useMemo(() => {
    if (!rowSchema) return {};
    const errs: Record<number, Record<string, string>> = {};
    rows.forEach((row, rowIndex) => {
      const parsed = rowSchema.safeParse(row);
      if (!parsed.success) {
        const flat = parsed?.error?.flatten();
        errs[rowIndex] = {};
        if (flat?.fieldErrors) {

          for (const [field, messages] of Object.entries(flat.fieldErrors)) {
            if (messages.length > 0) {
              errs[rowIndex][field] = messages[0];
            }
          }
        }
      }
    });
    return errs;
  }, [rows, rowSchema]);

  const allErrors = useMemo(() => {
    const merged: Record<number, Record<string, string>> = {};
    const allRowIndices = new Set([
      ...Object.keys(internalErrors).map(Number),
      ...Object.keys(externalErrors).map(Number),
    ]);
    for (const idx of allRowIndices) {
      merged[idx] = { ...(externalErrors[idx] || {}), ...(internalErrors[idx] || {}) };
    }
    return merged;
  }, [internalErrors, externalErrors]);

  const handleCellChange = (rowIndex: number, fieldName: string, fieldValue: any) => {
    const updated = rows.map((row, i) => {
      if (i !== rowIndex) return row;
      const nextRow = { ...row, [fieldName]: fieldValue };
      const field = matrixFields.find((f) => f.name === fieldName);
      if (field?.compute) {
        const patch = field.compute(nextRow, fieldValue);
        if (patch) return { ...nextRow, ...patch };
      }
      return nextRow;
    });
    onChange(updated);
  };

  const handleRowFill = (rowIndex: number, item: Record<string, unknown>, triggerField: string) => {
    const field = matrixFields.find((f) => f.name === triggerField);
    const fillData = field?.hints?.fill ? field.hints.fill(item) : { ...item };
    onChange(rows.map((row, i) => {
      if (i !== rowIndex) return row;
      const nextRow = { ...row, ...fillData };
      if (field?.compute) {
        const patch = field.compute(nextRow, nextRow[triggerField]);
        if (patch) return { ...nextRow, ...patch };
      }
      return nextRow;
    }));
  };

  const addRow = () => {
    onChange([...rows, { ...defaultRow }]);
  };

  const removeRow = (rowIndex: number) => {
    onChange(rows.filter((_, i) => i !== rowIndex));
  };

  const canAdd = numberOfRows === undefined && rows.length < maxRows;
  const canRemove = numberOfRows === undefined && rows.length > minRows;

  const getColumnWidth = (field: string): number => {
    const table = tableRef.current;
    if (!table) return 150;
    const index = matrixFields.findIndex((f) => f.name === field);
    const th = table.querySelectorAll('thead th')[index] as HTMLElement | undefined;
    return th ? th.getBoundingClientRect().width : 150;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const table = tableRef.current;
      const tableWidth = table ? table.getBoundingClientRect().width : 0;
      const next = Math.min(Math.max(drag.startWidth + (e.clientX - drag.startX), 60), Math.max(tableWidth, 500));
      setColWidths((prev) => ({ ...prev, [drag.field]: next }));
    };
    const handleMouseUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (dragRef.current) {
        dragRef.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, []);

  const startResize = (e: React.MouseEvent, field: string) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { field, startX: e.clientX, startWidth: getColumnWidth(field) };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const getTableAnchorRect = (rowIndex: number): HintRect | null => {
    const table = tableRef.current;
    if (!table) return null;
    const tableRect = table.getBoundingClientRect();
    const row = table.querySelector('tbody')?.querySelectorAll('tr')[rowIndex];
    if (!row) return { top: tableRect.bottom, left: tableRect.left, width: tableRect.width };
    const rowRect = row.getBoundingClientRect();
    return { top: rowRect.bottom, left: tableRect.left, width: tableRect.width };
  };

  return (
    <div className="space-y-2">
      <div className=" border border-border rounded-md">
<table ref={tableRef} className="w-full border-collapse table-fixed">
          <colgroup>
            {matrixFields.map((field) => (
              <col key={field.name} style={colWidths[field.name] ? { width: colWidths[field.name] } : undefined} />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-muted/50">
              {matrixFields.map((field) => (
                <th
                  key={field.name}
                  className={`group relative px-3 py-2 text-xs font-semibold text-text text-center border-b border-border ${baseClasses}`}
                >
                  {field.label}
                  <div
                    onMouseDown={(e) => startResize(e, field.name)}
                    className="absolute top-0 bottom-0 right-0 w-1.5 cursor-col-resize bg-transparent hover:bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ touchAction: 'none' }}
                  />
                </th>
              ))}
              {canRemove && (
                <th className="px-3 py-2 text-xs font-semibold text-text border-b border-border w-10" />
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border last:border-b-0">
                {matrixFields.map((field) => {
                  const cellError = allErrors[rowIndex]?.[field.name];
                  const selectedInOtherRows = field.excludeSelected
                    ? rows.filter((_, i) => i !== rowIndex).map(r => r[field.name]).filter(v => v != null && v !== '')
                    : [];
                  const cellOptions = selectedInOtherRows.length > 0
                    ? field.options?.filter(opt => !selectedInOtherRows.includes(opt.value))
                    : field.options;
                  return (
                    <td key={field.name} className="align-top">
                      {field.hints ? (
                        <div className="relative">
                          <HintsInput
                            value={row[field.name]}
                            onChange={(val) => handleCellChange(rowIndex, field.name, val)}
                            onSelectItem={(item) => handleRowFill(rowIndex, item, field.name)}
                            searchApi={field.hints!.searchApi}
                            dependentData={dependentData}
                            minChars={field.hints.minChars}
                            debounceMs={field.hints.debounceMs}
                            formatValue={(item) => (field.hints!.displayValue ? field.hints!.displayValue(item) : String(item[field.name] ?? ''))}
                            placeholder={field.placeholder}
                            disabled={field.disabled ?? disabled}
                            baseClasses={`${inputBaseClasses} border-0 focus:ring-0 rounded-none ${cellError ? 'border-danger ring-danger/10' : ''}`}
                            anchorRect={() => getTableAnchorRect(rowIndex)}
                            renderDropList={(items, activeIdx, onSelect) => (
                              <HintDropList
                                items={items}
                                fields={matrixFields}
                                activeIndex={activeIdx}
                                onSelect={onSelect}
                                showActionsColumn={canRemove}
                              />
                            )}
                          />
                          {cellError && <div className={errorClasses}>{cellError}</div>}
                        </div>
                      ) : (
                        <>
                          <Input
                            type={field.type || 'text'}
                            value={row[field.name]}
                            onChange={(val) => handleCellChange(rowIndex, field.name, val)}
                            options={cellOptions}
                            placeholder={field.placeholder}
                            disabled={field.disabled ?? disabled}
                            required={field.required}
                            searchable={field.searchable}
                            createTitle={field.createTitle}
                            renderCreateForm={field.renderCreateForm}
                            dependentData={dependentData}
                            labelPath={field.labelPath}
                            createButtonPermission={field.createButtonPermission}
                            decimalPlaces={field.decimalPlaces}
                            allowNegative={field.allowNegative}
                            baseClasses={`${inputBaseClasses} border-0 focus:ring-0 rounded-none ${cellError ? 'border-danger ring-danger/10' : ''}`}
                          />
                          {cellError && <div className={errorClasses}>{cellError}</div>}
                        </>
                      )}
                    </td>
                  );
                })}
                {canRemove && (
                  <td className="px-1 py-1 text-center align-middle">
                    <button
                      type="button"
                      onClick={() => removeRow(rowIndex)}
                      disabled={disabled}
                      className="p-1 text-danger/70 hover:text-danger transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {canAdd && (
        <Button type="button" variant="outline" size="sm" onClick={addRow} disabled={disabled} leftIcon={<Plus size={14} />}>
          {t('common.add_row')}
        </Button>
      )}
    </div>
  );
}
