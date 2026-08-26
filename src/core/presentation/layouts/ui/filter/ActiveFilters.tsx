import { useEffect, useState } from "react";
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

function getStaticOptions(field: FilterField): { value: any; label: string }[] | undefined {
  if ("options" in field && field.options) return field.options as { value: any; label: string }[];
  return undefined;
}

function toDisplay(
  field: FilterField,
  raw: any,
  formatValue?: (key: string, value: any) => string,
  resolvedOptions?: { value: any; label: string }[],
): string {
  const values = Array.isArray(raw) ? raw : [raw];
  const options = resolvedOptions ?? getStaticOptions(field);

  const display = values.map((v) => {
    // Select fields (static or computed): show the human-readable option label, not the raw id/value
    if (options) {
      const opt = options.find((o) => String(o.value) === String(v));
      if (opt) return opt.label;
    }
    if( "type" in field){
      if(field.type == "checkbox"){
        return v ? 'نعم' : 'لا'
      }
    }
    
    const out = formatValue ? formatValue(field.name, v) : undefined;
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
  const [resolvedOptions, setResolvedOptions] = useState<Record<string, { value: any; label: string }[]>>({});

  // Resolve options for computed select fields (those that use `compute` instead of a static `options` array).
  // We pass the current filter values so dependent computes (e.g. faculty depends on university) still work.
  // Key the effect on a stable string signature (not object identity) to avoid re-running on every render
  // when parent re-creates the `fields`/`filters` objects.
  const signature = fields
    .filter(
      (f) =>
        !isEmpty(filters[f.name]) &&
        "compute" in f &&
        typeof (f as any).compute === "function",
    )
    .map((f) => {
      const val = filters[f.name];
      const valStr = Array.isArray(val) ? val.join(",") : String(val);
      return `${f.name}=${valStr}`;
    })
    .join("&");

  useEffect(() => {
    const computedFields = fields.filter(
      (f) =>
        !isEmpty(filters[f.name]) &&
        !("options" in f && f.options) &&
        "compute" in f &&
        typeof (f as any).compute === "function",
    ) as Array<FilterField & { compute: (values: any) => any }>;

    if (computedFields.length === 0) {
      setResolvedOptions({});
      return;
    }

    let cancelled = false;
    Promise.all(
      computedFields.map(async (f) => {
        const result = await Promise.resolve(f.compute(filters));
        return [f.name, (result?.options ?? []) as { value: any; label: string }[]] as const;
      }),
    ).then((pairs) => {
      if (!cancelled) setResolvedOptions(Object.fromEntries(pairs));
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

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
          <span className="font-bold text-text">{toDisplay(field, filters[field.name], formatValue, resolvedOptions[field.name])}</span>
        </span>
      ))}
    </div>
  );
}
