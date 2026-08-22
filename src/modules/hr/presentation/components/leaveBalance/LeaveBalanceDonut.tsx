import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import type { LeaveBalance } from "../../../domain/entities/leaveBalance/leaveBalance"

interface LeaveBalanceDonutProps {
  leaveBalance: LeaveBalance
  size?: number
}

export function LeaveBalanceDonut({ leaveBalance, size = 192 }: LeaveBalanceDonutProps) {
  const { t } = useLanguage()

  const donutData = [
    { name: t("leave_balance.available", "hr"), value: Math.max(0, leaveBalance.available_units), color: "var(--color-success)" },
    { name: t("leave_balance.consumed", "hr"), value: Math.max(0, leaveBalance.consumed_units * -1), color: "var(--color-danger)" },
  ].filter((d) => d.value > 0)

  const total = Math.max(0, leaveBalance.available_units - leaveBalance.consumed_units)
  
  if (donutData.length === 0) return null

  return (
    <div className="flex items-center gap-4 md:gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={donutData}
              dataKey="value"
              nameKey="name"
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
          <span className="font-black text-text" style={{ fontSize: Math.max(14, size * 0.14) }}>
            {leaveBalance.available_units}
          </span>
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">
            {t("leave_balance.available", "hr")}
          </span>
        </div>
      </div>

      <div className="space-y-2.5 flex-1 min-w-[140px]">
        {donutData.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-xs font-semibold text-text-muted">{entry.name}</span>
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
  )
}