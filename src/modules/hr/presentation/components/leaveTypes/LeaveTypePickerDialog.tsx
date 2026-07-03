import { useEffect } from "react"
import { useLeaveTypes } from "../../hooks/leave/useLeaveTypes"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { SelectFromTable } from "../../../../../core/presentation/layouts/ui/picker/SelectFromTable"
import type { ColumnDef } from "../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import type { EntityWithNameOnly } from "../../../../../core/domain/entities/EntityWithNameOnly"

interface LeaveTypePickerDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (selected: EntityWithNameOnly[]) => void
    multiple?: boolean
    initialSelected?: EntityWithNameOnly[],
    eligible?:boolean
    defaultFilter?: Record<string, any>
}

export function LeaveTypePickerDialog({
    isOpen,
    onClose,
    onConfirm,
    multiple = false,
    initialSelected = [],
    eligible = false,
    defaultFilter,
}: LeaveTypePickerDialogProps) {
    const { t, language } = useLanguage()
    const { items: leaveTypes, userEligibleLeaveTypes, loading ,isLoading, error, pagination, filter, setSearch, setPage, setFilter, resetFilter , findUserEligibleLeaveTypes } = useLeaveTypes()

    useEffect(() => {
        if(eligible){
            findUserEligibleLeaveTypes()
        }
    } ,[])

    const columns: ColumnDef<EntityWithNameOnly>[] = [
        {
            key: "name",
            label: t("leave_types.type_name", "hr") || "Leave Type",
            width: 300,
            render: (row) => (typeof row.name === "string" ? row.name : language === "ar" ? row.name.ar : row.name.en),
        },
    ]

    const filterFields = [
        { name: "unit", label: t("leave.unit", "hr"), type: "select" as const, options: [{ value: "day", label: t("leave.unit_day", "hr") }, { value: "hour", label: t("leave.unit_hour", "hr") }] },
        { name: "balance_mode", label: t("leave.balance_mode", "hr"), type: "select" as const, options: [
            { value: "accrual", label: t("leave.balance_accrual", "hr") },
            { value: "fixed_grant", label: t("leave.balance_fixed_grant", "hr") },
            { value: "once_per_life", label: t("leave.balance_once_per_life", "hr") },
            { value: "once_per_service", label: t("leave.balance_once_per_service", "hr") },
            { value: "none", label: t("leave.balance_none", "hr") },
        ] },
        { name: "accrual_period", label: t("leave.accrual_period", "hr"), type: "select" as const, options: [{ value: "yearly", label: t("leave.accrual_yearly", "hr") }, { value: "monthly", label: t("leave.accrual_monthly", "hr") }, { value: "none", label: t("leave.accrual_none", "hr") }] },
        { name: "is_paid", label: t("leave.is_paid", "hr"), type: "checkbox" as const },
        { name: "is_active", label: t("leave.is_active", "hr"), type: "checkbox" as const },
        { name: "requires_approval", label: t("leave.requires_approval", "hr"), type: "checkbox" as const },
        { name: "allow_half_day", label: t("leave.allow_half_day", "hr"), type: "checkbox" as const },
        { name: "allow_hourly", label: t("leave.allow_hourly", "hr"), type: "checkbox" as const },
        { name: "allow_split", label: t("leave.allow_split", "hr"), type: "checkbox" as const },
    ]

    const handleApplyFilter = (values: Record<string, any>) => {
        const parsed: Record<string, any> = { page: 1, per_page: filter.per_page }
        for (const [key, val] of Object.entries(values)) {
            if (val === "" || val === undefined) {
                continue
            } else if (val === "true") {
                parsed[key] = true
            } else if (val === "false") {
                parsed[key] = false
            } else {
                parsed[key] = val
            }
        }
        setFilter(() => parsed as any)
    }

    return (
        <SelectFromTable
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title={t("leave_types.picker_title", "hr") || "Select Leave Types"}
            multiple={multiple}
            initialSelected={initialSelected}
            defaultFilter={defaultFilter}
            onApplyDefaultFilter={(parsed) => setFilter(parsed as any)}
            data={eligible ? userEligibleLeaveTypes : leaveTypes}
            columns={columns}
            isLoading={isLoading()}
            error={error.findAll}
            onSearch={(query) => setSearch(query)}
            searchInitialValue={filter.search || ""}
            filterFields={filterFields}
            filterValues={filter}
            onApplyFilter={handleApplyFilter}
            onResetFilter={resetFilter}
            page={pagination.currentPage}
            perPage={filter.per_page}
            totalPages={pagination.lastPage}
            totalItems={pagination.total}
            onPageChange={setPage}
            onPerPageChange={(size) => setFilter({ per_page: size, page: 1 })}
            emptyMessage={t("leave_types.no_data", "hr") || "No leave types found"}
        />
    )
}
