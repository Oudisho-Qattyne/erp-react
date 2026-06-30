import { useState, useEffect, useRef } from "react"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { Button } from "../../../../../core/presentation/layouts/ui/buttons/Button"
import { DataTable, type ColumnDef } from "../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import { LoadingState } from "../../../../../core/presentation/layouts/ui/state/LoadingState"
import { ErrorState } from "../../../../../core/presentation/layouts/ui/state/ErrorState"
import { FilterDialog, type FilterField } from "../../../../../core/presentation/layouts/ui/filter/FilterDialog"
import { LeaveTypePickerDialog } from "../../components/leaveTypes/LeaveTypePickerDialog"
import { EmployeePickerDialog } from "../../components/employee/EmployeePickerDialog"
import { useLeaveBalance } from "../../hooks/leaveBalance/useLeaveBalance"
import type { LeaveBalance } from "../../../domain/entities/leaveBalance/leaveBalance"
import type { EmployeeListItem } from "../../../domain/entities/EmployeeListItem"
import type { EntityWithNameOnly } from "../../../../../core/domain/entities/EntityWithNameOnly"
import type { UseFormReturn } from "react-hook-form"
import { User, X, FileText, Filter, Search } from "lucide-react"
import { MiniRing } from "../../../../../core/presentation/layouts/ui/statistics/MiniRing"
import Input from "../../../../../core/presentation/layouts/ui/inputs/Input"
import { ro } from "zod/locales"

export const EmployeeLeaveBalances = () => {
    const { t, language } = useLanguage()
    const { employeeLeaveBalances, findAllEmployeeLeaveBalances, loading, error, pagination, filter, setPage, setFilter, resetFilter, setSearch } = useLeaveBalance()

    const [sortColumn, setSortColumn] = useState<string>("leave_type_name")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [localSearch, setLocalSearch] = useState<string>("")
    const [employeePickerOpen, setEmployeePickerOpen] = useState(false)
    const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>("")
    const [leaveTypePickerOpen, setLeaveTypePickerOpen] = useState(false)
    const [selectedLeaveTypeName, setSelectedLeaveTypeName] = useState<string | undefined>("")
    const formRef = useRef<UseFormReturn | null>(null)
    const SORT_FIELD_MAP: Record<string, string> = {
        leave_type_name: "leave_type_name",
        accrual_period: "accrual_period",
        entitled_units: "entitled_units",
        consumed_units: "consumed_units",
        available_units: "available_units",
        carried_forward_units: "carried_forward_units",
        adjustment_added_units: "adjustment_added_units",
        adjustment_deducted_units: "adjustment_deducted_units",
    }

    const handleSort = (columnKey: string) => {
        const field = SORT_FIELD_MAP[columnKey]
        if (!field) return
        const newOrder = columnKey === sortColumn && sortOrder === "asc" ? "desc" : "asc"
        setSortColumn(columnKey)
        setSortOrder(newOrder)
        setFilter((prev) => {
            const next = { ...prev } as any
            Object.values(SORT_FIELD_MAP).forEach((f) => delete next[`sort_by[${f}]`])
            next[`sort_by[${field}]`] = newOrder
            return next
        })
    }

    const handleSearch = () => setSearch(localSearch)

    const getLocalizedTypeName = (lt: EntityWithNameOnly) =>
        typeof lt.name === "string" ? lt.name : language === "ar" ? lt.name.ar : lt.name.en

    const handleEmployeePicked = (employees: EmployeeListItem[]) => {
        const emp = employees[0]
        if (emp) {
            setSelectedEmployeeName(emp.full_name)
            formRef.current?.setValue("employee_id", String(emp.id))
        }
        setEmployeePickerOpen(false)
    }

    const handleLeaveTypePicked = (types: EntityWithNameOnly[]) => {
        const lt = types[0]
        if (lt) {
            setSelectedLeaveTypeName(getLocalizedTypeName(lt))
            formRef.current?.setValue("leave_type_id", String(lt.id))
        }
        setLeaveTypePickerOpen(false)
    }

    const filterFields: FilterField[] = [
        {
            name: "employee_id",
            render: (form) => {
                formRef.current = form
                return (
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">
                            {t("leave_request.employee_name", "hr") || "Employee"}
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background text-sm text-text-muted">
                                <User size={14} />
                                {selectedEmployeeName || (t("common.all", "shared") || "All")}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setEmployeePickerOpen(true)}>
                                {t("common.select", "shared") || "Select"}
                            </Button>
                            {selectedEmployeeName && (
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedEmployeeName(""); form.setValue("employee_id", "") }}>
                                    <X size={14} />
                                </Button>
                            )}
                        </div>
                    </div>
                )
            },
        },
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
        const parsed: Record<string, any> = { page: 1, per_page: filter.per_page }
        for (const [key, val] of Object.entries(values)) {
            if (val === "" || val === undefined) continue
            if (key === "leave_type_id" || key === "employee_id") {
                parsed[key] = Number(val)
            } else {
                parsed[key] = val
            }
        }
        setFilter(() => parsed as any)
        setIsFilterOpen(false)
    }

    useEffect(() => {
        findAllEmployeeLeaveBalances()
    }, [filter])

    const columns: ColumnDef<LeaveBalance>[] = [
        { key: "leave_type_name", label: t("leave_balance.leave_type", "hr") || "Leave Type", width: 160, sortable: true },
        { key: "employee_name", label: t("leave_balance.employee_name", "hr") || "Leave Type", width: 130,  render: (row) => `${row.employee_first_name} ${row.employee_last_name}`},
        {
            key: "accrual_period", label: t("leave_balance.accrual_period", "hr") || "Period", width: 90, sortable: true,
            render: (row) => row.accrual_period === "yearly"
                ? (t("leave_balance.yearly", "hr") || "Yearly")
                : (t("leave_balance.monthly", "hr") || "Monthly")
        },
        { key: "entitled_units", label: t("leave_balance.entitled", "hr") || "Entitled", width: 100, sortable: true },
        { key: "consumed_units", label: t("leave_balance.consumed", "hr") || "Consumed", width: 100, sortable: true },
        { key: "available_units", label: t("leave_balance.available", "hr") || "Available", width: 100, sortable: true },
        { key: "carried_forward_units", label: t("leave_balance.carried_forward", "hr") || "Carried Fwd", width: 110, sortable: true },
        { key: "adjustment_added_units", label: t("leave_balance.adjustment_added", "hr") || "Adj +", width: 80, sortable: true },
        { key: "adjustment_deducted_units", label: t("leave_balance.adjustment_deducted", "hr") || "Adj -", width: 80, sortable: true },
        {
            key: "ring", label: "", width: 100, align: "center",
            render: (row) => <MiniRing value={row.available_units} total={row.entitled_units} />,
        },
    ]

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">{t("employee_leave_balances.title", "hr") || "Employee Leave Balances"}</h1>

            {loading.findAllEmployeeLeaveBalances ? (
                <LoadingState />
            ) : error.findAllEmployeeLeaveBalances ? (
                <ErrorState message={error.findAllEmployeeLeaveBalances} onRetry={() => findAllEmployeeLeaveBalances()} />
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
                        sortColumn={sortColumn}
                        sortOrder={sortOrder}
                        onSort={handleSort}
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

            <FilterDialog
                isOpen={isFilterOpen}
                fields={filterFields}
                initialValues={filter}
                onFilter={handleApplyFilter}
                onCancel={() => setIsFilterOpen(false)}
                onReset={() => { resetFilter(); setSelectedEmployeeName(""); setSelectedLeaveTypeName(""); setIsFilterOpen(false) }}
            />

            <EmployeePickerDialog
                isOpen={employeePickerOpen}
                onClose={() => setEmployeePickerOpen(false)}
                onConfirm={handleEmployeePicked}
                multiple={false}
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
