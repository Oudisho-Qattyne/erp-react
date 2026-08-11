import React, { useMemo, useRef } from 'react';
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
}: DataMatrixInputProps) {
  const { t } = useLanguage();
  const tableRef = useRef<HTMLTableElement>(null);
  const defaultRow = useMemo(() => getDefaultRow(matrixFields), [matrixFields]);
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
    const updated = rows.map((row, i) =>
      i === rowIndex ? { ...row, [fieldName]: fieldValue } : row
    );
    onChange(updated);
  };

  const handleRowFill = (rowIndex: number, item: Record<string, unknown>, triggerField: string) => {
    const field = matrixFields.find((f) => f.name === triggerField);
    const fillData = field?.hints?.fill ? field.hints.fill(item) : { ...item };
    onChange(rows.map((row, i) =>
      i === rowIndex ? { ...row, ...fillData } : row
    ));
  };

  const addRow = () => {
    onChange([...rows, { ...defaultRow }]);
  };

  const removeRow = (rowIndex: number) => {
    onChange(rows.filter((_, i) => i !== rowIndex));
  };

  const canAdd = numberOfRows === undefined && rows.length < maxRows;
  const canRemove = numberOfRows === undefined && rows.length > minRows;

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
          <thead>
            <tr className="bg-muted/50">
              {matrixFields.map((field) => (
                <th
                  key={field.name}
                  className={`px-3 py-2 text-xs font-semibold text-text text-left border-b border-border ${baseClasses}`}
                >
                  {field.label}
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
