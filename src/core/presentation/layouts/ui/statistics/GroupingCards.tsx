import { useStatistics, type GroupingStatisticsFilters } from "../../../hooks/data/statistics/useStatistics";
import type { FactorOption } from "./FactorSelect";
import { Spinner } from "../state/Spinner";
import { ErrorState } from "../state/ErrorState";

const CALM_COLORS = [
  '#C98B6D',
  '#D2A97E',
  '#D2B56E',
  '#C08E80',
  '#CEAAA5',
  '#B49A83',
  '#C9B09A',
  '#B08067',
  '#CFBCA2',
  '#C18272',
];

function generateColor(index: number): string {
  return CALM_COLORS[index % CALM_COLORS.length];
}

interface GroupingCardsProps {
  title?: string;
  baseUrl: string;
  factors: FactorOption[];
  factor: string;
  filters?: GroupingStatisticsFilters;
  className?: string;
}

export function GroupingCards({
  baseUrl,
  factor,
  filters,
  className,
}: GroupingCardsProps) {
  const { data, loading, error, refresh } = useStatistics({
    baseUrl,
    factor,
    defaultFilter: filters,
  });

  const items = data
    .map((row, i) => ({
      label: String(row.label ?? ""),
      value: Number(row.value ?? 0),
      color: generateColor(i),
    }))
    .sort((a, b) => b.value - a.value);

  const total = items.reduce((sum, i) => sum + i.value, 0);

  return (
    <div className={`flex-1 min-w-70 ${className ?? ""}`}>
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && error && (
        <ErrorState message={error} onRetry={refresh} />
      )}

      {!loading && !error && items.length === 0 && (
        <div className="flex items-center justify-center py-4 text-sm text-text-muted">
          No data
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="flex flex-wrap gap-2.5">
          {items.map((item) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div
                key={item.label}
                className="flex flex-col flex-1 basis-40 min-w-36 max-w-full p-3 rounded-lg border border-border bg-card transition-colors hover:bg-muted/60"
              >
                <span className="flex items-center gap-1.5 truncate text-[10px] font-bold text-text-muted uppercase tracking-wide">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
                <span className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-black text-text text-3xl leading-none">{item.value}</span>
                  {total > 0 && (
                    <span className="text-[10px] font-bold text-text-muted">({pct}%)</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}