import { useState } from "react";
import { useStatistics, type GroupingStatisticsFilters } from "../../../hooks/data/statistics/useStatistics";
import { DonutCard, type DonutItem, type DonutSize } from "./DonutCard";
import { CustomSelect } from "../inputs/CustomSelect";
import { Spinner } from "../state/Spinner";
import { ErrorState } from "../state/ErrorState";

function generateColor(index: number): string {
  const hue = (index * 137.508) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

interface FactorOption {
  value: string;
  label: string;
}

interface GroupingDonutProps {
  title: string;
  baseUrl: string;
  factors: FactorOption[];
  filters?: GroupingStatisticsFilters;
  defaultFactor?: string;
  showFactor?: boolean;
  factorLabel?: string;
  disableFactor?: boolean;
  centerLabel?: string;
  /** Show the donut chart. Default true */
  showDonut?: boolean;
  /** Donut size: 'sm' (120px), 'md' (192px), 'lg' (260px). Default 'md' */
  size?: DonutSize;
  className?: string;
}

export function GroupingDonut({
  title,
  baseUrl,
  factors,
  filters,
  defaultFactor,
  showFactor = true,
  factorLabel,
  disableFactor,
  centerLabel,
  showDonut = true,
  size,
  className,
}: GroupingDonutProps) {
  const [factor, setFactor] = useState<string>(defaultFactor ?? factors[0]?.value ?? "");

  const { data, loading, error, refresh } = useStatistics({
    baseUrl,
    factor,
    defaultFilter: filters,
  });

  const items: DonutItem[] = data.map((row, i) => ({
    label: String(row.label ?? ""),
    value: Number(row.value ?? 0),
    color: generateColor(i),
  }));

  return (
    <div className={`flex-1 min-w-70 rounded-2xl border border-border bg-card shadow-sm ${className ?? ""}`}>
      {showFactor && (
        <div className="p-4 border-b border-border">
          {factorLabel && (
            <label className="block text-xs font-semibold text-text-muted mb-1.5">{factorLabel}</label>
          )}
          <CustomSelect
            options={factors}
            value={factor}
            onChange={(v) => setFactor(String(v))}
            disabled={disableFactor}
          />
        </div>
      )}

      <div className="p-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {!loading && error && (
          <ErrorState message={error} onRetry={refresh} />
        )}

        {!loading && !error && (
          <DonutCard title={title} items={items} centerLabel={centerLabel} showDonut={showDonut} size={size} className="w-full" />
        )}
      </div>
    </div>
  );
}
