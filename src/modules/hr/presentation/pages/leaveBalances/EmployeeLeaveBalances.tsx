import { useState, useEffect } from "react"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { Button } from "../../../../../core/presentation/layouts/ui/buttons/Button"
import { DataTable, type ColumnDef } from "../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import { LoadingState } from "../../../../../core/presentation/layouts/ui/state/LoadingState"
import { ErrorState } from "../../../../../core/presentation/layouts/ui/state/ErrorState"
import { FilterDialog, type FilterField } from "../../../../../core/presentation/layouts/ui/filter/FilterDialog"
import { useLeaveBalance } from "../../hooks/leaveBalance/useLeaveBalance"
import { useLeaveTypes } from "../../hooks/leave/useLeaveTypes"
import { EmployeePickerDialog } from "../../components/employee/EmployeePickerDialog"
import type { LeaveBalance } from "../../../domain/entities/leaveBalance/leaveBalance"
import type { EmployeeListItem } from "../../../domain/entities/EmployeeListItem"
import { User, X, Filter, Search } from "lucide-react"
import { MiniRing } from "../../../../../core/presentation/layouts/ui/statistics/MiniRing"
import Input from "../../../../../core/presentation/layouts/ui/inputs/Input"

export const EmployeeLeaveBalances = () => {
    const { t } = useLanguage()
    const { employeeLeaveBalances, findAllEmployeeLeaveBalances, loading, error, pagination, filter, setPage, setFilter, resetFilter, setSearch } = useLeaveBalance()

    const { items: leaveTypes } = useLeaveTypes()
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeListItem | null>(null)
    const [isPickerOpen, setIsPickerOpen] = useState(false)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [fetchEmployeeId, setFetchEmployeeId] = useState<number | null>(null)
    const [localSearch, setLocalSearch] = useState<string>("")
    const handleSearch = () => setSearch(localSearch)

    const handleEmployeePicked = (employees: EmployeeListItem[]) => {
        const emp = employees[0]
        if (emp) {
            setSelectedEmployee(emp)
            setFetchEmployeeId(emp.id)
            resetFilter()
        }
        setIsPickerOpen(false)
    }

    const filterFields: FilterField[] = [
        { name: "leave_type_id", label: t("leave_balance.leave_type", "hr") || "Leave Type", type: "select", options: leaveTypes.map((lt) => ({ value: String(lt.id), label: typeof lt.name == "string" ? lt.name : lt.name.ar })) },
    ]

    const handleApplyFilter = (values: Record<string, any>) => {
        const parsed: Record<string, any> = {}
        for (const [key, val] of Object.entries(values)) {
            if (val === "" || val === undefined) {
                parsed[key] = undefined
            } else if (key === "leave_type_id") {
                parsed[key] = Number(val)
            } else {
                parsed[key] = val
            }
        }
        setFilter(parsed as any)
        setIsFilterOpen(false)
    }

    useEffect(() => {
        if (fetchEmployeeId !== null) {
            findAllEmployeeLeaveBalances(fetchEmployeeId)
        }
    }, [filter, fetchEmployeeId])

    const columns: ColumnDef<LeaveBalance>[] = [
        { key: "leave_type_name", label: t("leave_balance.leave_type", "hr") || "Leave Type", width: 160 },
        {
            key: "accrual_period", label: t("leave_balance.accrual_period", "hr") || "Period", width: 90,
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

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">{t("employee_leave_balances.title", "hr") || "Employee Leave Balances"}</h1>

            {!selectedEmployee ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-xl">
                    <User size={48} className="text-text-muted mb-4" />
                    <p className="text-text-muted mb-4">{t("employee_leave_balances.select_prompt", "hr") || "Select an employee to view their leave balances"}</p>
                    <Button variant="primary" onClick={() => setIsPickerOpen(true)}>
                        {t("employee_leave_balances.select_employee", "hr") || "Select Employee"}
                    </Button>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary-light/20 flex items-center justify-center">
                                <User size={24} className="text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-text">{selectedEmployee.full_name}</p>
                                <p className="text-sm text-text-muted">
                                    {selectedEmployee.internal_id}{selectedEmployee.national_id ? ` | ${selectedEmployee.national_id}` : ""}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">

                            <Button variant="ghost" size="sm" onClick={() => { setSelectedEmployee(null); setFetchEmployeeId(null) }}>
                                <X size={16} className="mr-1" />
                                {t("common.change", "shared") || "Change"}
                            </Button>
                        </div>
                    </div>

                    {loading.findAllEmployeeLeaveBalances ? (
                        <LoadingState />
                    ) : error.findAllEmployeeLeaveBalances ? (
                        <ErrorState message={error.findAllEmployeeLeaveBalances} onRetry={() => fetchEmployeeId && findAllEmployeeLeaveBalances(fetchEmployeeId)} />
                    ) : (
                        <div className="relative w-full ">
                            <div className="relative flex gap-3 py-3">

                                <div className="relative flex-1 max-w-sm">
                                    <Input
                                        type="text"
                                        placeholder={t("common.search", "shared") || "Search..."}
                                        value={localSearch}
                                        onChange={(val) => setLocalSearch(val as string)}
                                    />
                                </div>
                                <Button variant="primary" size="sm" onClick={handleSearch} leftIcon={<Search size={14} />}>
                                    {t("common.search", "shared") || "Search"}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)} leftIcon={<Filter size={14} />}>
                                    {t("common.filter", "shared") || "Filter"}
                                </Button>
                                <Button variant="outline" size="sm" onClick={resetFilter}>
                                    {t("common.reset", "shared") || "Reset"}
                                </Button>
                            </div>

                            <DataTable
                                columns={columns}
                                data={employeeLeaveBalances}
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
                        </div>

                    )}
                </>
            )}

            <EmployeePickerDialog
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onConfirm={handleEmployeePicked}
                multiple={false}
            />

            <FilterDialog
                isOpen={isFilterOpen}
                fields={filterFields}
                initialValues={filter}
                onFilter={handleApplyFilter}
                onCancel={() => setIsFilterOpen(false)}
                onReset={() => { resetFilter(); setIsFilterOpen(false) }}
            />

        </div>
    )
}
