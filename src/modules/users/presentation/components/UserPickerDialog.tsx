import { useState, useEffect } from "react"
import { Dialog } from "../../../../core/presentation/layouts/ui/dialog/Dialog"
import { Button } from "../../../../core/presentation/layouts/ui/buttons/Button"
import { DataTable, type ColumnDef } from "../../../../core/presentation/layouts/ui/tables/ResizableTable"
import { FilterDialog, type FilterField } from "../../../../core/presentation/layouts/ui/filter/FilterDialog"
import Input from "../../../../core/presentation/layouts/ui/inputs/Input"
import { LoadingState } from "../../../../core/presentation/layouts/ui/state/LoadingState"
import { ErrorState } from "../../../../core/presentation/layouts/ui/state/ErrorState"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { Filter, Search } from "lucide-react"
import type { User } from "../../../users/domain/entities/user/user"
import { useManageUsers } from "../hooks/user/userManageUsers"

interface UserPickerDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selected: User[]) => void
  multiple?: boolean
  initialSelected?: User[]
  defaultFilter?: Record<string, any>
}

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-gray-100 text-gray-500 border-gray-200",
  suspended: "bg-danger/10 text-danger border-danger/20",
}

export function UserPickerDialog({
  isOpen,
  onClose,
  onConfirm,
  multiple = false,
  initialSelected = [],
  defaultFilter,
}: UserPickerDialogProps) {
  const { t } = useLanguage()
  const { users, loading, error, pagination, filter, setSearch, setPage, setFilter, resetFilter, getAllUsers } = useManageUsers()

  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>(initialSelected.map((e) => e.id))
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState("")

  useEffect(() => {
    getAllUsers()
  }, [filter])

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

  const filterFields: FilterField[] = [
    { name: "status", label: t("users.status", "users"), type: "select", options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "active", label: t("users.status_active", "users") },
      { value: "inactive", label: t("users.status_inactive", "users") },
      { value: "suspended", label: t("users.status_suspended", "users") },
    ]},
    { name: "linked_to_user", label: t("users.linked_to_employee", "users") || "Linked to Employee", type: "select", options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "true", label: t("common.yes", "shared") || "Yes" },
      { value: "false", label: t("common.no", "shared") || "No" },
    ]},
  ]

    const handleApplyFilter = (values: Record<string, any>) => {
        const parsed: Record<string, any> = { page: 1, per_page: filter.per_page }
        for (const [key, val] of Object.entries(values)) {
            if (val === "" || val === undefined) continue
            if (val === "true") parsed[key] = true
            else if (val === "false") parsed[key] = false
            else parsed[key] = val
        }
        setFilter(() => parsed as any)
        setIsFilterOpen(false)
    }

  const handleSearch = () => setSearch(localSearch)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  const handleConfirm = () => {
    const selected = users.filter((u) => selectedKeys.includes(u.id))
    onConfirm(selected)
    onClose()
  }

  const handleRowClick = (row: User) => {
    if (!multiple) {
      onConfirm([row])
      onClose()
    }
  }

  const columns: ColumnDef<User>[] = [
    { key: "id", label: "#", width: 60 },
    { key: "name", label: t("users.name", "users") || "Name", width: 180 },
    { key: "email", label: t("users.email", "users") || "Email", width: 200 },
    { key: "mobile", label: t("users.mobile", "users") || "Mobile", width: 140 },
    {
      key: "status",
      label: t("users.status", "users") || "Status",
      width: 110,
      render: (row) => (
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${statusStyles[row.status] || ""}`}>
          {t(`users.status_${row.status}`, "users") || row.status}
        </span>
      ),
    },
  ]

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t("users.picker_title", "users") || "Select Users"}
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

        {loading.getAllUsers && <LoadingState />}
        {error.getAllUsers && !loading.getAllUsers && (
          <ErrorState message={error.getAllUsers} onRetry={() => getAllUsers()} />
        )}
        {!loading.getAllUsers && !error.getAllUsers && (
          <DataTable
            columns={columns}
            data={users}
            rowKey="id"
            selectable={multiple || undefined}
            selectedRows={multiple ? selectedKeys : undefined}
            onSelectionChange={multiple ? setSelectedKeys : undefined}
            onRowClick={multiple ? undefined : handleRowClick}
            pagination={{
              page: pagination.currentPage,
              totalPages: pagination.lastPage,
              totalItems: pagination.total,
              onPageChange: setPage,
              itemsPerPage: filter.per_page,
              onItemsPerPageChange: (size) => setFilter({ per_page: size, page: 1 }),
              itemsPerPageOptions: [10, 25, 50, 100],
            }}
            emptyMessage={t("users.no_data", "users") || "No users found"}
          />
        )}

        {multiple && selectedKeys.length > 0 && (
          <div className="text-sm text-text-muted">
            {selectedKeys.length} {t("common.selected", "shared") || "selected"}
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
