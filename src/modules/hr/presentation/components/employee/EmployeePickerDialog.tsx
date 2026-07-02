import { useState } from "react"
import { useEmployee } from "../../hooks/employee/useEmployee"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { SelectFromTable } from "../../../../../core/presentation/layouts/ui/picker/SelectFromTable"
import type { ColumnDef } from "../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import type { EmployeeListItem } from "../../../domain/entities/EmployeeListItem"

interface EmployeePickerDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selected: EmployeeListItem[]) => void
  multiple?: boolean
  initialSelected?: EmployeeListItem[]
  defaultFilter?: Record<string, any>
}

export function EmployeePickerDialog({
  isOpen,
  onClose,
  onConfirm,
  multiple = false,
  initialSelected = [],
  defaultFilter,
}: EmployeePickerDialogProps) {
  const { t } = useLanguage()
  const { employees, loading, error, pagination, filter, setSearch, setPage, setFilter, resetFilter, findAllEmployees } = useEmployee()
  const [sortBy, setSortBy] = useState<string | undefined>(undefined)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const handleSort = (columnKey: string) => {
    const newOrder = sortBy === columnKey && sortOrder === "asc" ? "desc" : "asc"
    setSortBy(columnKey)
    setSortOrder(newOrder)
    setFilter({ [`sort_by[${columnKey}]`]: newOrder } as any)
  }

  const columns: ColumnDef<EmployeeListItem>[] = [
    { key: "internal_id", label: t("employees.internal_id", "hr"), width: 100, sortable: true },
    { key: "full_name", label: t("employees.full_name", "hr"), width: 200, sortable: true },
    { key: "national_id", label: t("employees.national_id", "hr"), width: 150, sortable: true },
    { key: "gender", label: t("employees.gender", "hr"), width: 80 },
    { key: "created_at", label: t("employees.created_at", "hr"), width: 120, sortable: true },
  ]

  const filterFields = [
    { name: "gender", label: t("employees.gender", "hr"), type: "select" as const, options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "male", label: t("employees.gender_male", "hr") },
      { value: "female", label: t("employees.gender_female", "hr") },
    ]},
    { name: "marital_status", label: t("employees.marital_status", "hr"), type: "select" as const, options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "single", label: t("employees.marital_single", "hr") },
      { value: "married", label: t("employees.marital_married", "hr") },
      { value: "divorced", label: t("employees.marital_divorced", "hr") },
      { value: "widowed", label: t("employees.marital_widowed", "hr") },
    ]},
    { name: "blood_type", label: t("employees.blood_type", "hr"), type: "select" as const, options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "A+", label: "A+" }, { value: "A-", label: "A-" },
      { value: "B+", label: "B+" }, { value: "B-", label: "B-" },
      { value: "AB+", label: "AB+" }, { value: "AB-", label: "AB-" },
      { value: "O+", label: "O+" }, { value: "O-", label: "O-" },
    ]},
    { name: "date_birth", label: t("employees.date_birth", "hr"), type: "date" as const },
    { name: "has_sham_cash_account", label: t("employees.has_sham_cash_account", "hr"), type: "select" as const, options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "true", label: t("common.yes", "shared") },
      { value: "false", label: t("common.no", "shared") },
    ]},
    { name: "linked_to_user", label: t("employees.linked_to_user", "hr") || "Linked to User", type: "select" as const, options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "true", label: t("common.yes", "shared") },
      { value: "false", label: t("common.no", "shared") },
    ]},
  ]

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = { page: 1, per_page: filter.per_page }
    for (const [key, val] of Object.entries(values)) {
      if (val !== "" && val !== undefined) parsed[key] = val
    }
    setFilter(() => parsed as any)
  }

  return (
    <SelectFromTable
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("employees.picker_title", "hr") || "Select Employees"}
      multiple={multiple}
      initialSelected={initialSelected}
      defaultFilter={defaultFilter}
      onApplyDefaultFilter={(parsed) => setFilter(parsed as any)}
      data={employees}
      columns={columns}
      isLoading={loading.findAllEmployees}
      error={error.findAllEmployees}
      onSearch={(query) => setSearch(query)}
      searchPlaceholder={t("employees.search_placeholder", "hr") || "Search..."}
      searchInitialValue={filter.search || ""}
      filterFields={filterFields}
      filterValues={filter}
      onApplyFilter={handleApplyFilter}
      onResetFilter={resetFilter}
      sortColumn={sortBy}
      sortOrder={sortOrder}
      onSort={handleSort}
      page={pagination.currentPage}
      perPage={filter.per_page}
      totalPages={pagination.lastPage}
      totalItems={pagination.total}
      onPageChange={setPage}
      onPerPageChange={(size) => setFilter({ per_page: size, page: 1 })}
      emptyMessage={t("employees.no_data", "hr") || "No employees found"}
    />
  )
}
