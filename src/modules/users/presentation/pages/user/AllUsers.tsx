import { useEffect, useState } from "react"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { Button } from "../../../../../core/presentation/layouts/ui/buttons/Button"
import { DataTable, type ColumnDef } from "../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import { Dialog } from "../../../../../core/presentation/layouts/ui/dialog/Dialog"
import Input from "../../../../../core/presentation/layouts/ui/inputs/Input"
import { LoadingState } from "../../../../../core/presentation/layouts/ui/state/LoadingState"
import { ErrorState } from "../../../../../core/presentation/layouts/ui/state/ErrorState"
import { FilterDialog, type FilterField } from "../../../../../core/presentation/layouts/ui/filter/FilterDialog"
import { useManageUsers } from "../../hooks/user/userManageUsers"
import { CreateUserForm } from "../../components/CreateUserForm"
import { ShowUserDialog } from "../../components/ShowUserDialog"
import type { User } from "../../../domain/entities/user/user"
import { Search, Download, FileText, Plus, Filter, Eye, Pencil } from "lucide-react"

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-gray-100 text-gray-500 border-gray-200",
  suspended: "bg-danger/10 text-danger border-danger/20",
}

export function AllUsers() {
  const { t, language } = useLanguage()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editUser, setEditUser] = useState<User | null>(null)

  
  const {
    users,
    loading,
    error,
    pagination,
    filter,
    setFilter,
    resetFilter,
    getAllUsers,
    createUser,
    exportUsersExcel,
    exportUsersPdf,
  } = useManageUsers()

  const handleSearch = () => {
    setFilter({ search: localSearch, page: 1 } as any)
  }

  useEffect(() => {
    getAllUsers()
  } , [filter])
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
    {
      key: "role",
      label: t("users.role", "users") || "Role",
      width: 140,
      render: (row) => (language === "ar" ? row.role?.display_name : row.role?.name) || "-",
    },
    { key: "created_at", label: t("users.created_at", "users") || "Created At", width: 160, render: (row) => row.created_at },
    {
      key: "actions",
      label: "",
      width: 100,
      align: "center",
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedUser(row)}
            title={t("common.view", "shared") || "View"}
            requiredPermission="users.users.view"
          >
            <Eye size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditUser(row)}
            title={t("common.edit", "shared") || "Edit"}
            requiredPermission="users.users.edit"
          >
            <Pencil size={16} />
          </Button>
        </div>
      ),
    },
  ]
  const filterFields: FilterField[] = [
    { name: "status", label: t("users.status", "users") || "Status", type: "select", options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "active", label: t("users.status_active", "users") || "Active" },
      { value: "inactive", label: t("users.status_inactive", "users") || "Inactive" },
      { value: "suspended", label: t("users.status_suspended", "users") || "Suspended" },
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
            if (val !== "" && val !== undefined) parsed[key] = val
        }
        setFilter(() => parsed as any)
        setIsFilterOpen(false)
    }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("users.title", "users") || "Users"}</h1>
        <div className="flex items-center gap-2">
          {/* <Button
            variant="outline"
            size="sm"
            onClick={exportUsersExcel}
            isLoading={loading.exportUsersExcel}
            leftIcon={<Download size={14} />}
            requiredPermission="users.users.export"
          >
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportUsersPdf}
            isLoading={loading.exportUsersPdf}
            leftIcon={<FileText size={14} />}
            requiredPermission="users.users.export"
          >
            PDF
          </Button> */}
          <Button
            variant="primary"
            onClick={() => setIsAddOpen(true)}
            leftIcon={<Plus size={16} />}
            requiredPermission="users.users.add"
          >
            {t("users.add", "users") || "Add User"}
          </Button>
        </div>
      </div>



      {loading.getAllUsers ? (
        <LoadingState />
      ) : error.getAllUsers ? (
        <ErrorState message={error.getAllUsers} onRetry={() => getAllUsers()} />
      ) : (
        <div className="relative w-full">
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

          <FilterDialog
            isOpen={isFilterOpen}
            fields={filterFields}
            initialValues={filter}
            onFilter={handleApplyFilter}
            onCancel={() => setIsFilterOpen(false)}
            onReset={() => { resetFilter(); setIsFilterOpen(false) }}
          />

          <DataTable
            columns={columns}
            data={users}
            rowKey="id"
            onRowClick={() => {}}
            loading={loading.getAllUsers}
            emptyMessage={t("users.no_data", "users") || "No users found"}
            pagination={{
              page: pagination.currentPage,
              totalPages: pagination.lastPage,
              totalItems: pagination.total,
              itemsPerPage: filter.per_page,
              onPageChange: (page) => setFilter({ page }),
              onItemsPerPageChange: (size) => setFilter({ per_page: size, page: 1 }),
              itemsPerPageOptions: [10, 25, 50, 100],
            }}
          />
        </div>
      )}

      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={t("users.add_title", "users") || "Add New User"}
        size="md"
      >
        <CreateUserForm
          onSuccess={() => { setIsAddOpen(false); getAllUsers() }}
          onCancel={() => setIsAddOpen(false)}
        />
      </Dialog>

      {selectedUser && (
        <ShowUserDialog
          user={selectedUser}
          isOpen={!!selectedUser}
          onClose={() => { setSelectedUser(null); getAllUsers() }}
        />
      )}

      {editUser && (
        <ShowUserDialog
          user={editUser}
          isOpen={!!editUser}
          startEditing
          onClose={() => { setEditUser(null); getAllUsers() }}
        />
      )}
    </div>
  )
}
