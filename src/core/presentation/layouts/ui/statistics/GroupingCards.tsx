import { useState, type ReactNode } from "react";
import { useStatistics, type GroupingStatisticsFilters } from "../../../hooks/data/statistics/useStatistics";
import { CustomSelect } from "../inputs/CustomSelect";
import { Spinner } from "../state/Spinner";
import { ErrorState } from "../state/ErrorState";
import { inputBaseClasses } from "../inputs/styles";

function generateColor(index: number): string {
  const hue = (index * 137.508) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

interface FactorOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface GroupingCardsProps {
  title?: string;
  baseUrl: string;
  factors: FactorOption[];
  filters?: GroupingStatisticsFilters;
  defaultFactor?: string;
  showFactor?: boolean;
  factorLabel?: string;
  disableFactor?: boolean;
  className?: string;
}

export function GroupingCards({
  title,
  baseUrl,
  factors,
  filters,
  defaultFactor,
  showFactor = true,
  factorLabel,
  disableFactor,
  className,
}: GroupingCardsProps) {
  const [factor, setFactor] = useState<string>(defaultFactor ?? factors[0]?.value ?? "");

  const { data, loading, error, refresh } = useStatistics({
    baseUrl,
    factor,
    defaultFilter: filters,
  });

  console.log(data);
  
  // const items = data.map((row, i) => ({
  //   label: String(row.label ?? ""),
  //   value: Number(row.value ?? 0),
  //   color: generateColor(i),
  // }));
const items = []
  const total = items.reduce((sum, i) => sum + i.value, 0);
  const selectedFactor = factors.find((f) => f.value === factor);

  return (
    <div className={`flex-1 min-w-70 ${className ?? ""}`}>
      {title && (
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 bg-primary rounded-full animate-pulse" />
          <h4 className="text-base font-black text-text tracking-tight">{title}</h4>
        </div>
      )}

      {showFactor && (
        <div className=" max-w-1/3">
          {factorLabel && (
            <label className="block text-xs font-semibold text-text-muted mb-1.5">{factorLabel}</label>
          )}
          <CustomSelect
          baseClasses={inputBaseClasses}
            options={factors}
            value={factor}
            onChange={(v) => setFactor(String(v))}
            disabled={disableFactor}
          />
        </div>
      )}

      <div className="py-2">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Spinner size="lg" />
          </div>
        )}

        {!loading && error && (
          <ErrorState message={error} onRetry={refresh} />
        )}

        {!loading && !error && items.length === 0 && (
          <div className="flex items-center justify-center text-sm text-text-muted">
            No data
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <div
                key={item.label}
                className="flex flex-col py-2 px-4 rounded-xl border border-border bg-muted/30 min-w-60 bg-card"
              >
                <span className="font-semibold text-text-muted text-[10px] uppercase tracking-wide flex items-center gap-1">
                  {selectedFactor?.icon && (
                    <span className="text-success">{selectedFactor.icon}</span>
                  )}
                  {item.label}
                </span>
                <span className="font-black text-text text-3xl">
                  {item.value}
                </span>
                {total > 0 && (
                  <span className="text-[10px] text-text-muted mt-0.5">
                    ({Math.round((item.value / total) * 100)}%)
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
