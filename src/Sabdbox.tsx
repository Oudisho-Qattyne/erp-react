import { useEffect } from "react"
import { useLeaveBalance } from "./modules/hr/presentation/hooks/leaveBalance/useLeaveBalance"
import { ComparisonChart } from "./core/presentation/layouts/ui/statistics/ComparisonChart"
import { Spinner } from "./core/presentation/layouts/ui/state/Spinner"

export const Sandbox = () => {
  const { myLeaveBalances, loading, findAllMyLeaveBalances } = useLeaveBalance()

  useEffect(() => {
    findAllMyLeaveBalances()
  }, [])

  if (loading.findAllMyLeaveBalances) {
    return <Spinner size="xl" />
  }

  const chartData = myLeaveBalances.map((lb) => ({
    name: lb.leave_type_name,
    consumed: lb.consumed_units,
    available: lb.available_units,
    carriedForward: lb.carried_forward_units,
    correctionAdded: lb.system_correction_added_units,
    correctionDeducted: -lb.system_correction_deducted_units,
    adjustmentAdded: lb.adjustment_added_units,
    adjustmentDeducted: -lb.adjustment_deducted_units,
  }))

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <ComparisonChart
        title="Leave Balance Breakdown"
        data={chartData}
        xKey="name"
        bars={[
          { key: "consumed", label: "Consumed", color: "#ef4444" },
          { key: "available", label: "Available", color: "#22c55e" },
          { key: "carriedForward", label: "Carried Forward", color: "#3b82f6" },
          { key: "correctionAdded", label: "Correction +", color: "#a855f7" },
          { key: "correctionDeducted", label: "Correction -", color: "#f97316" },
          { key: "adjustmentAdded", label: "Adjustment +", color: "#06b6d4" },
          { key: "adjustmentDeducted", label: "Adjustment -", color: "#eab308" },
        ]}
        height={400}
      />
    </div>
  )
}
