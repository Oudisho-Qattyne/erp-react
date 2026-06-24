import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { DataTable, type ColumnDef } from "../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import { LoadingState } from "../../../../../core/presentation/layouts/ui/state/LoadingState"
import { ErrorState } from "../../../../../core/presentation/layouts/ui/state/ErrorState"
import { OccupancyCard } from "../../../../../core/presentation/layouts/ui/statistics/OccupancyCard"
import { useLeaveBalance } from "../../hooks/leaveBalance/useLeaveBalance"
import type { LeaveBalance } from "../../../domain/entities/leaveBalance/leaveBalance"
import { MiniRing } from "../../../../../core/presentation/layouts/ui/statistics/MiniRing"
import { useEffect } from "react"

export const UserLeaveBalances = () => {
  const { t } = useLanguage()
  const { myLeaveBalances,findAllMyLeaveBalances, loading, error, pagination, filter, setPage, setFilter } = useLeaveBalance()

  const columns: ColumnDef<LeaveBalance>[] = [
    { key: "leave_type_name", label: t("leave_balance.leave_type", "hr") || "Leave Type", width: 160 },
    { key: "accrual_period", label: t("leave_balance.accrual_period", "hr") || "Period", width: 90,
      render: (row) => row.accrual_period === "yearly"
        ? (t("leave_balance.yearly", "hr") || "Yearly")
        : (t("leave_balance.monthly", "hr") || "Monthly")
    },
    { key: "entitled_units", label: t("leave_balance.entitled", "hr") || "Entitled", width: 100 },
    { key: "consumed_units", label: t("leave_balance.consumed", "hr") || "Consumed", width: 100 },
    { key: "available_units", label: t("leave_balance.available", "hr") || "Available", width: 100 },
    { key: "carried_forward_units", label: t("leave_balance.carried_forward", "hr") || "Carried Fwd", width: 110 },
    { key: "adjustment_added_units", label: t("leave_balance.adjustment_added", "hr") || "Adj +", width: 80 },
    { key: "adjustment_deducted_units", label: t("leave_balance.adjustment_deducted", "hr") || "Adj -", width: 80 },
    {
      key: "ring", label: "", width: 200, align: "center",
      render: (row) => <MiniRing value={row.available_units} total={row.entitled_units} />,
    },
  ]
  
  useEffect(() => {
    findAllMyLeaveBalances()
  }, [filter])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t("leave_balance.my_balances", "hr") || "My Leave Balances"}</h1>

      {loading.findAllMyLeaveBalances ? (
        <LoadingState />
      ) : error.findAllMyLeaveBalances ? (
        <ErrorState message={error.findAllMyLeaveBalances} onRetry={() => {}} />
      ) : (
        <DataTable
          columns={columns}
          data={myLeaveBalances}
          rowKey="leave_type_id"
          emptyMessage={t("leave_balance.no_data", "hr") || "No leave balances found"}
          pagination={{
            page: pagination.currentPage,
            totalPages: pagination.lastPage,
            totalItems: pagination.total,
            itemsPerPage: filter.per_page,
            onPageChange: setPage,
            onItemsPerPageChange: (size) => setFilter({ per_page: size, page: 1 }),
            itemsPerPageOptions: [10, 25, 50, 100],
          }}
        />
      )}
    </div>
  )
}
