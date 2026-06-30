import { useState, useEffect } from "react"
import { Dialog } from "../../../../../core/presentation/layouts/ui/dialog/Dialog"
import { Button } from "../../../../../core/presentation/layouts/ui/buttons/Button"
import { DataTable, type ColumnDef } from "../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import { FilterDialog, type FilterField } from "../../../../../core/presentation/layouts/ui/filter/FilterDialog"
import Input from "../../../../../core/presentation/layouts/ui/inputs/Input"
import { LoadingState } from "../../../../../core/presentation/layouts/ui/state/LoadingState"
import { ErrorState } from "../../../../../core/presentation/layouts/ui/state/ErrorState"
import { useEmployee } from "../../hooks/employee/useEmployee"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { Filter, Search } from "lucide-react"
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

  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>(initialSelected.map((e) => e.id))
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState(filter.search || "")
  const [sortBy, setSortBy] = useState<string | undefined>(undefined)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    if (isOpen) {
      setSelectedKeys(initialSelected.map((e) => e.id))
      if (defaultFilter) {
        const parsed: Record<string, any> = {}
        for (const [key, val] of Object.entries(defaultFilter)) {
          if (val === "true") parsed[key] = true
          else if (val === "false") parsed[key] = false
          else parsed[key] = val
        }
        setFilter(parsed as any)
      }
    }
  }, [isOpen, defaultFilter])

  const handleSort = (columnKey: string) => {
    const newOrder = sortBy === columnKey && sortOrder === "asc" ? "desc" : "asc"
    setSortBy(columnKey)
    setSortOrder(newOrder)
    setFilter({ [`sort_by[${columnKey}]`]: newOrder } as any)
  }

  const filterFields: FilterField[] = [
    { name: "gender", label: t("employees.gender", "hr"), type: "select", options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "male", label: t("employees.gender_male", "hr") },
      { value: "female", label: t("employees.gender_female", "hr") },
    ]},
    { name: "marital_status", label: t("employees.marital_status", "hr"), type: "select", options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "single", label: t("employees.marital_single", "hr") },
      { value: "married", label: t("employees.marital_married", "hr") },
      { value: "divorced", label: t("employees.marital_divorced", "hr") },
      { value: "widowed", label: t("employees.marital_widowed", "hr") },
    ]},
    { name: "blood_type", label: t("employees.blood_type", "hr"), type: "select", options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "A+", label: "A+" }, { value: "A-", label: "A-" },
      { value: "B+", label: "B+" }, { value: "B-", label: "B-" },
      { value: "AB+", label: "AB+" }, { value: "AB-", label: "AB-" },
      { value: "O+", label: "O+" }, { value: "O-", label: "O-" },
    ]},
    { name: "date_birth", label: t("employees.date_birth", "hr"), type: "date" },
    { name: "has_sham_cash_account", label: t("employees.has_sham_cash_account", "hr"), type: "select", options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "true", label: t("common.yes", "shared") },
      { value: "false", label: t("common.no", "shared") },
    ]},
    { name: "linked_to_user", label: t("employees.linked_to_user", "hr") || "Linked to User", type: "select", options: [
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
        setIsFilterOpen(false)
    }

  const handleSearch = () => setSearch(localSearch)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  const handleConfirm = () => {
    const selected = employees.filter((e) => selectedKeys.includes(e.id))
    onConfirm(selected)
    onClose()
  }

  const handleRowClick = (row: EmployeeListItem) => {
    if (!multiple) {
      onConfirm([row])
      onClose()
    }
  }

  const columns: ColumnDef<EmployeeListItem>[] = [
    { key: "internal_id", label: t("employees.internal_id", "hr"), width: 100, sortable: true },
    { key: "full_name", label: t("employees.full_name", "hr"), width: 200, sortable: true },
    { key: "national_id", label: t("employees.national_id", "hr"), width: 150, sortable: true },
    { key: "gender", label: t("employees.gender", "hr"), width: 80 },
    { key: "created_at", label: t("employees.created_at", "hr"), width: 120, sortable: true },
  ]

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t("employees.picker_title", "hr") || "Select Employees"}
      size="2xl"
      actions={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel", "shared") || "Cancel"}
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={selectedKeys.length === 0}>
            {t("common.confirm", "shared") || "Confirm"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Input
              type="text"
              placeholder={t("employees.search_placeholder", "hr") || "Search..."}
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

        {loading.findAllEmployees && <LoadingState />}
        {error.findAllEmployees && !loading.findAllEmployees && (
          <ErrorState message={error.findAllEmployees} onRetry={() => {}} />
        )}
        {!loading.findAllEmployees && !error.findAllEmployees && (
          <DataTable
            columns={columns}
            data={employees}
            rowKey="id"
            selectable={multiple || undefined}
            selectedRows={multiple ? selectedKeys : undefined}
            onSelectionChange={multiple ? setSelectedKeys : undefined}
            onRowClick={multiple ? undefined :handleRowClick}
            sortColumn={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            pagination={{
              page: pagination.currentPage,
              totalPages: pagination.lastPage,
              totalItems: pagination.total,
              onPageChange: setPage,
              itemsPerPage: filter.per_page,
              onItemsPerPageChange: (size) => setFilter({ per_page: size, page: 1 }),
              itemsPerPageOptions: [10, 25, 50, 100],
            }}
            emptyMessage={t("employees.no_data", "hr") || "No employees found"}
          />
        )}

        {multiple && selectedKeys.length > 0 && (
          <div className="text-sm text-text-muted">
            {selectedKeys.length} {t("employees.selected", "hr") || "selected"}
          </div>
        )}
      </div>

      <FilterDialog
        isOpen={isFilterOpen}
        fields={filterFields}
        initialValues={filter}
        onFilter={handleApplyFilter}
        onCancel={() => setIsFilterOpen(false)}
        onReset={() => { resetFilter(); setIsFilterOpen(false) }}
      />
    </Dialog>
  )
}
