import { useState, useEffect, useRef } from "react"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { Button } from "../../../../../core/presentation/layouts/ui/buttons/Button"
import { DataTable, type ColumnDef } from "../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import { LoadingState } from "../../../../../core/presentation/layouts/ui/state/LoadingState"
import { ErrorState } from "../../../../../core/presentation/layouts/ui/state/ErrorState"
import { OccupancyCard } from "../../../../../core/presentation/layouts/ui/statistics/OccupancyCard"
import { FilterDialog, type FilterField } from "../../../../../core/presentation/layouts/ui/filter/FilterDialog"
import { LeaveTypePickerDialog } from "../../components/leaveTypes/LeaveTypePickerDialog"
import { useLeaveBalance } from "../../hooks/leaveBalance/useLeaveBalance"
import type { LeaveBalance } from "../../../domain/entities/leaveBalance/leaveBalance"
import type { EntityWithNameOnly } from "../../../../../core/domain/entities/EntityWithNameOnly"
import type { UseFormReturn } from "react-hook-form"
import { Filter, FileText, X } from "lucide-react"
import { LeaveBalanceDonut } from "../../components/leaveBalance/LeaveBalanceDonut"

export const UserLeaveBalances = () => {
  const { t, language } = useLanguage()
  const { myLeaveBalances, myPagination, findAllMyLeaveBalances, loading, error, filter, setFilter, setPage, resetFilter } = useLeaveBalance()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [leaveTypePickerOpen, setLeaveTypePickerOpen] = useState(false)
  const [selectedLeaveTypeName, setSelectedLeaveTypeName] = useState<string | undefined>("")
  const formRef = useRef<UseFormReturn | null>(null)

  const getLocalizedTypeName = (lt: EntityWithNameOnly) =>
    typeof lt.name === "string" ? lt.name : language === "ar" ? lt.name.ar : lt.name.en

  const handleLeaveTypePicked = (types: EntityWithNameOnly[]) => {
    const lt = types[0]
    if (lt) {
      if(getLocalizedTypeName(lt)){
        setSelectedLeaveTypeName(getLocalizedTypeName(lt))
        formRef.current?.setValue("leave_type_id", String(lt.id))
      }
    }
    setLeaveTypePickerOpen(false)
  }

  const filterFields: FilterField[] = [
    {
      name: "leave_type_id",
      render: (form) => {
        formRef.current = form
        return (
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              {t("leave_balance.leave_type", "hr") || "Leave Type"}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background text-sm text-text-muted">
                <FileText size={14} />
                {selectedLeaveTypeName || (t("common.all", "shared") || "All")}
              </div>
              <Button variant="outline" size="sm" onClick={() => setLeaveTypePickerOpen(true)}>
                {t("common.select", "shared") || "Select"}
              </Button>
              {selectedLeaveTypeName && (
                <Button variant="ghost" size="sm" onClick={() => { setSelectedLeaveTypeName(""); form.setValue("leave_type_id", "") }}>
                  <X size={14} />
                </Button>
              )}
            </div>
          </div>
        )
      },
    },
  ]

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = {}
    for (const [key, val] of Object.entries(values)) {
      if (val === "" || val === undefined) continue
      if (key === "leave_type_id") {
        parsed[key] = Number(val)
      } else {
        parsed[key] = val
      }
    }
    setFilter(() => parsed as any)
    setIsFilterOpen(false)
  }

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
      key: "chart", label: "", width: 340,
      render: (row) => <LeaveBalanceDonut leaveBalance={row} size={112} />,
    },
  ]
  
  useEffect(() => {
    findAllMyLeaveBalances()
  }, [filter])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t("leave_balance.my_balances", "hr") || "My Leave Balances"}</h1>

      {error.findAllMyLeaveBalances ? (
        <ErrorState message={error.findAllMyLeaveBalances} onRetry={() => findAllMyLeaveBalances()} />
      ) : (
        <>
          <div className="flex gap-3 py-3">
            <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)} leftIcon={<Filter size={14} />}>
              {t("common.filter", "shared") || "Filter"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => { resetFilter(); setSelectedLeaveTypeName("") }}>
              {t("common.reset", "shared") || "Reset"}
            </Button>
          </div>
          <DataTable
            columns={columns}
            data={myLeaveBalances}
            rowKey="leave_type_id"
            loading={loading.findAllMyLeaveBalances}
            emptyMessage={t("leave_balance.no_data", "hr") || "No leave balances found"}
            pagination={{
              page: myPagination.currentPage,
              totalPages: myPagination.lastPage,
              totalItems: myPagination.total,
              onPageChange: setPage,
              itemsPerPage: filter.per_page,
              onItemsPerPageChange: (size) => setFilter({ per_page: size, page: 1 }),
              itemsPerPageOptions: [10, 25, 50, 100],
            }}
          />
        </>
      )}
      <FilterDialog
        isOpen={isFilterOpen}
        fields={filterFields}
        initialValues={filter}
        onFilter={handleApplyFilter}
        onCancel={() => setIsFilterOpen(false)}
        onReset={() => { resetFilter(); setSelectedLeaveTypeName(""); setIsFilterOpen(false) }}
      />
      <LeaveTypePickerDialog
        isOpen={leaveTypePickerOpen}
        onClose={() => setLeaveTypePickerOpen(false)}
        onConfirm={handleLeaveTypePicked}
        multiple={false}
      />
    </div>
  )
}
