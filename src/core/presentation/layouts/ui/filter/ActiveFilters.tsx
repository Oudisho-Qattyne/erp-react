import type { ReactNode } from "react";
import type { FilterField } from "./FilterDialog";

export interface ActiveFiltersProps {
  /** The currently applied filter values, keyed by field name */
  filters: Record<string, any>;
  /** Field definitions used to resolve labels/options (and ordering) */
  fields: FilterField[];
  /** Optional value formatter (e.g. translate enums). Receives the raw value. */
  formatValue?: (key: string, value: any) => string;
  /** Optional heading rendered before the chips */
  title?: ReactNode;
  className?: string;
}

function isEmpty(v: any): boolean {
  return v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
}

function toDisplay(
  field: FilterField,
  raw: any,
  formatValue?: (key: string, value: any) => string,
): string {
  const values = Array.isArray(raw) ? raw : [raw];

  const display = values.map((v) => {
    let out = formatValue ? formatValue(field.name, v) : undefined;
    if (out === undefined || out === String(v)) {
      if ("options" in field && field.options) {
        const opt = field.options.find((o) => String(o.value) === String(v));
        if (opt) out = opt.label;
      }
    }
    return out ?? String(v);
  });

  return display.join("، ");
}

export function ActiveFilters({
  filters,
  fields,
  formatValue,
  title,
  className = "",
}: ActiveFiltersProps) {
  const active = fields.filter(
    (f) => "label" in f && !isEmpty(filters[f.name]),
  ) as Extract<FilterField, { label?: string }>[];

  if (active.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {title && (
        <span className="text-xs font-bold text-text-muted">{title}</span>
      )}
      {active.map((field) => (
        <span
          key={field.name}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-card text-xs"
        >
          <span className="font-semibold text-text-muted">{field.label}:</span>
          <span className="font-bold text-text">{toDisplay(field, filters[field.name], formatValue)}</span>
        </span>
      ))}
    </div>
  );
}
