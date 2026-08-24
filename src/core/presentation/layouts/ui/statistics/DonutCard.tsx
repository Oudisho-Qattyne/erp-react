import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export interface DonutItem {
  label: string;
  value: number;
  color: string;
}

interface DonutCardProps {
  title: string;
  items: DonutItem[];
  /** Small text shown under the total in the donut center */
  centerLabel?: string;
  size?: number;
  className?: string;
}

export function DonutCard({
  title,
  items,
  centerLabel,
  size = 192,
  className = "",
}: DonutCardProps) {
  const total = items.reduce((sum, i) => sum + i.value, 0);
  const donutData = items.filter((i) => i.value > 0);

  return (
    <div
      className={`p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-500 ${className}`}
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-5 bg-primary rounded-full animate-pulse" />
        <h4 className="text-base font-black text-text tracking-tight">{title}</h4>
      </div>

      {total === 0 ? (
        <div className="flex items-center justify-center h-[120px] text-sm text-text-muted">
          No data
        </div>
      ) : (
        <div className="flex items-center gap-4 md:gap-6">
          <div className="relative shrink-0" style={{ width: size, height: size }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={size * 0.323}
                  outerRadius={size * 0.458}
                  paddingAngle={3}
                  strokeWidth={0}
                  startAngle={90}
                  endAngle={-270}
                >
                  {donutData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span
                className="font-black text-text"
                style={{ fontSize: Math.max(14, size * 0.14) }}
              >
                {total}
              </span>
              {centerLabel && (
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">
                  {centerLabel}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2.5 flex-1 min-w-[140px]">
            {donutData.map((entry) => (
              <div key={entry.label} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs font-semibold text-text-muted">{entry.label}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-text">{entry.value}</span>
                  {total > 0 && (
                    <span className="text-[10px] text-text-muted">
                      ({Math.round((entry.value / total) * 100)}%)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
