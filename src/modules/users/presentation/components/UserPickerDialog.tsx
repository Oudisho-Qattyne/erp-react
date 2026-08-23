import { useEffect, useState } from "react"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { SelectFromTable } from "../../../../core/presentation/layouts/ui/picker/SelectFromTable"
import type { ColumnDef } from "../../../../core/presentation/layouts/ui/tables/ResizableTable"
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
  const { users, loading, error, pagination, filter, setPage, setFilter, resetFilter, getAllUsers } = useManageUsers()

  const SORT_FIELDS = ["name", "email", "created_at"]
  const [sortColumn, setSortColumn] = useState<"name" | "email" | "created_at" | "">("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    if (isOpen) getAllUsers()
  }, [isOpen, filter])

  const columns: ColumnDef<User>[] = [
    { key: "id", label: "#", width: 60 },
    { key: "name", label: t("users.name", "users") || "Name", width: 180, sortable: true },
    { key: "email", label: t("users.email", "users") || "Email", width: 200, sortable: true },
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
    { key: "created_at", label: t("users.created_at", "users") || "Created At", width: 160, sortable: true, render: (row) => row.created_at || "—" },
  ]

  const handleSort = (column: string) => {
    if (!SORT_FIELDS.includes(column)) return
    const field = column as "name" | "email" | "created_at"
    const newOrder = sortColumn === field && sortOrder === "asc" ? "desc" : "asc"
    setSortColumn(sortColumn === field ? field : field)
    setSortOrder(newOrder)
    setFilter((prev: any) => {
      const next = { ...prev }
      for (const k of SORT_FIELDS) delete next[`sort_by[${k}]`]
      next[`sort_by[${field}]`] = newOrder
      return next
    })
  }

  const filterFields = [
    { name: "status", label: t("users.status", "users"), type: "select" as const, options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "active", label: t("users.status_active", "users") },
      { value: "inactive", label: t("users.status_inactive", "users") },
      { value: "suspended", label: t("users.status_suspended", "users") },
    ]},
    { name: "linked_to_user", label: t("users.linked_to_employee", "users") || "Linked to Employee", type: "select" as const, options: [
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
  }

  return (
    <SelectFromTable
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("users.picker_title", "users") || "Select Users"}
      multiple={multiple}
      initialSelected={initialSelected}
      defaultFilter={defaultFilter}
      onApplyDefaultFilter={(parsed) => setFilter(parsed as any)}
      data={users}
      columns={columns}
      isLoading={loading.getAllUsers}
      error={error.getAllUsers}
      onRetry={getAllUsers}
      searchPlaceholder={t("users.search_placeholder", "users") || "Search..."}
      filterFields={filterFields}
      filterValues={filter}
      onApplyFilter={handleApplyFilter}
      onResetFilter={() => { setSortColumn(""); setSortOrder("asc"); resetFilter() }}
      sortColumn={sortColumn}
      sortOrder={sortOrder}
      onSort={handleSort}
      page={pagination.currentPage}
      perPage={filter.per_page}
      totalPages={pagination.lastPage}
      totalItems={pagination.total}
      onPageChange={setPage}
      onPerPageChange={(size) => setFilter({ per_page: size, page: 1 })}
      emptyMessage={t("users.no_data", "users") || "No users found"}
    />
  )
}
