import React, { useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../buttons/Button';
import Input, { type InputType } from './Input';
import { inputBaseClasses, errorClasses } from './styles';

export interface MatrixFieldConfig {
  name: string;
  label: string;
  type?: InputType;
  required?: boolean;
  disabled?: boolean;
  options?: { value: number | string; label: string }[];
  placeholder?: string;
  defaultValue?: any;
  searchable?: boolean;
  createTitle?: string;
  renderCreateForm?: (onSuccess: (value: number | string, item?: unknown) => void, onCancel: () => void, dependentData?: Record<string, unknown>) => React.ReactNode;
  labelPath?: string;
  createButtonPermission?: string;
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
    } else if (field.type === 'number') {
      row[field.name] = 0;
    } else {
      row[field.name] = '';
    }
  }
  return row;
};

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

  const addRow = () => {
    onChange([...rows, { ...defaultRow }]);
  };

  const removeRow = (rowIndex: number) => {
    onChange(rows.filter((_, i) => i !== rowIndex));
  };

  const canAdd = numberOfRows === undefined && rows.length < maxRows;
  const canRemove = numberOfRows === undefined && rows.length > minRows;

  return (
    <div className="space-y-2">
      <div className=" border border-border rounded-md">
        <table className="w-full border-collapse table-fixed">
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
                  return (
                    <td key={field.name} className="align-top">
                      <Input
                        type={field.type || 'text'}
                        value={row[field.name]}
                        onChange={(val) => handleCellChange(rowIndex, field.name, val)}
                        options={field.options}
                        placeholder={field.placeholder}
                        disabled={field.disabled ?? disabled}
                        required={field.required}
                        searchable={field.searchable}
                        createTitle={field.createTitle}
                        renderCreateForm={field.renderCreateForm}
                        dependentData={dependentData}
                        labelPath={field.labelPath}
                        createButtonPermission={field.createButtonPermission}
                        baseClasses={`${inputBaseClasses} border-0 focus:ring-0 rounded-none ${cellError ? 'border-danger ring-danger/10' : ''}`}
                      />
                      {cellError && <div className={errorClasses}>{cellError}</div>}
                    </td>
                  );
                })}
                {canRemove && (
                  <td className="px-1 py-1 text-center align-middle">
                    <button
                      type="button"
                      onClick={() => removeRow(rowIndex)}
                      disabled={disabled}
                      className="p-1 text-danger/70 hover:text-danger transition-colors disabled:opacity-30"
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
          Add Row
        </Button>
      )}
    </div>
  );
}
