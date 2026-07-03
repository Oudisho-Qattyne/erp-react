import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { Button } from "../../../../../core/presentation/layouts/ui/buttons/Button"
import { DataTable, type ColumnDef } from "../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import { Dialog } from "../../../../../core/presentation/layouts/ui/dialog/Dialog"
import { ConfirmDialog } from "../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog"
import { FilterDialog, type FilterField } from "../../../../../core/presentation/layouts/ui/filter/FilterDialog"
import Input from "../../../../../core/presentation/layouts/ui/inputs/Input"
import { LoadingState } from "../../../../../core/presentation/layouts/ui/state/LoadingState"
import { ErrorState } from "../../../../../core/presentation/layouts/ui/state/ErrorState"
import { useLeaveTypes } from "../../hooks/leave/useLeaveTypes"
import LeaveForm from "./LeaveForm"
import { Eye, Edit, Archive, Trash2, Filter } from "lucide-react"
import type { EntityWithNameOnly } from "../../../../../core/domain/entities/EntityWithNameOnly"

type ConfirmAction = "archive" | "delete" | null

export default function LeavesTypesPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  const {
    items,
    loading,
    isLoading,
    error,
    hasErrors,
    pagination,
    filter,
    setSearch,
    setPage,
    setSort,
    setFilter,
    resetFilter,
    findAll,
    create,
    update,
    archive,
    delete: deleteFn,
  } = useLeaveTypes()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const filterFields: FilterField[] = [
    { name: "unit", label: t("leave.unit", "hr"), type: "select", options: [{ value: "day", label: t("leave.unit_day", "hr") }, { value: "hour", label: t("leave.unit_hour", "hr") }] },
    { name: "balance_mode", label: t("leave.balance_mode", "hr"), type: "select", options: [
      { value: "accrual", label: t("leave.balance_accrual", "hr") },
      { value: "fixed_grant", label: t("leave.balance_fixed_grant", "hr") },
      { value: "once_per_life", label: t("leave.balance_once_per_life", "hr") },
      { value: "once_per_service", label: t("leave.balance_once_per_service", "hr") },
      { value: "none", label: t("leave.balance_none", "hr") },
    ] },
    { name: "accrual_period", label: t("leave.accrual_period", "hr"), type: "select", options: [{ value: "yearly", label: t("leave.accrual_yearly", "hr") }, { value: "monthly", label: t("leave.accrual_monthly", "hr") }, { value: "none", label: t("leave.accrual_none", "hr") }] },
    { name: "is_paid", label: t("leave.is_paid", "hr"), type: "checkbox" },
    { name: "is_active", label: t("leave.is_active", "hr"), type: "checkbox" },
    { name: "requires_approval", label: t("leave.requires_approval", "hr"), type: "checkbox" },
    { name: "allow_half_day", label: t("leave.allow_half_day", "hr"), type: "checkbox" },
    { name: "allow_hourly", label: t("leave.allow_hourly", "hr"), type: "checkbox" },
    { name: "allow_split", label: t("leave.allow_split", "hr"), type: "checkbox" },
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
    setIsFilterOpen(false)
  }

  const columns: ColumnDef<EntityWithNameOnly>[] = [
    {
      key: "name",
      label: t("leave.name", "hr"),
      width: 250,
      sortable: true,
    },
    {
      key: "actions",
      label: t("common.actions", "shared") || "الإجراءات",
      width: 200,
      align: "center",
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/hr/leaves/${row.id}`) }} title={t("common.view", "shared") || "عرض"} requiredPermission="hr.leave-types.view">
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedId(row.id); setConfirmAction("archive") }} title={t("common.archive", "shared") || "أرشفة"} requiredPermission="hr.leave-types.update">
            <Archive size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedId(row.id); setConfirmAction("delete") }} title={t("common.delete", "shared") || "حذف"} requiredPermission="hr.leave-types.delete">
            <Trash2 size={16} className="text-danger" />
          </Button>
        </div>
      ),
    },
  ]

  const handleSort = (columnKey: string) => {
    if (columnKey === "name") {
      const dir = filter["sort_by[name]"] === "asc" ? "desc" : "asc"
      setSort("name", dir)
    }
  }

  const handleCreate = async (data: any) => {
    await create(data)
    setIsCreateOpen(false)
    findAll()
  }

  const handleConfirm = async () => {
    if (selectedId === null) return
    if (confirmAction === "archive") {
      await archive(selectedId)
    } else if (confirmAction === "delete") {
      await deleteFn(selectedId)
    }
    setConfirmAction(null)
    setSelectedId(null)
  }

  const sortColumn = filter["sort_by[name]"] ? "name" : undefined
  const sortOrder = sortColumn === "name" ? filter["sort_by[name]"] : undefined

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{t("leave_types.title", "hr") || "Leave Types"}</h1>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="text"
            placeholder={t("common.search", "shared") || "بحث..."}
            value={filter.search}
            onChange={(val) => setSearch(val as string)}
            className="w-56"
          />
          <Button variant="primary" onClick={() => findAll()} size="sm">
            {t("common.search", "shared") || "بحث"}
          </Button>
          <Button variant="outline" onClick={() => setIsFilterOpen(true)} size="sm" leftIcon={<Filter size={14} />}>
            {t("common.filter", "shared") || "تصفية"}
          </Button>
          <Button variant="outline" onClick={resetFilter} size="sm">
            {t("common.reset", "shared") || "مسح"}
          </Button>
        </div>
        <Button variant="primary" onClick={() => setIsCreateOpen(true)} requiredPermission="hr.leave-types.create">
          + {t("leave.add", "hr") || "إضافة إجازة"}
        </Button>
      </div>

      {error.findAll && !loading.findAll && <ErrorState message={error.findAll} onRetry={findAll} />}
      {!error.findAll && (
        <DataTable loading={loading.findAll}
          columns={columns}
          data={items}
          onRowClick={(row) => navigate(`/hr/leaves/${row.id}`)}
          rowKey="id"
          sortColumn={sortColumn}
          sortOrder={sortOrder as any}
          onSort={handleSort}
          pagination={{
            page: pagination.currentPage,
            totalPages: pagination.lastPage,
            totalItems: pagination.total,
            onPageChange: setPage,
            itemsPerPage: filter.per_page,
            onItemsPerPageChange: (size) => setPage(1),
            itemsPerPageOptions: [5, 10, 20, 50],
          }}
          emptyMessage={t("common.no_data", "shared") || "لا توجد إجازات"}
        />
      )}

      <FilterDialog
        isOpen={isFilterOpen}
        fields={filterFields}
        initialValues={filter}
        onFilter={handleApplyFilter}
        onCancel={() => setIsFilterOpen(false)}
        onReset={() => { resetFilter(); setIsFilterOpen(false) }}
      />

      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={t("leave.add", "hr") || "إضافة إجازة جديدة"} size="2xl">
        <LeaveForm onSubmit={handleCreate} onCancel={() => setIsCreateOpen(false)} />
      </Dialog>

      <ConfirmDialog
        isOpen={confirmAction === "archive"}
        title={t("leave.archive_title", "hr")}
        message={t("leave.archive_message", "hr")}
        type="alert"
        confirmLabel={t("leave.archive", "hr")}
        cancelLabel={t("common.cancel", "shared")}
        confirmLoading={loading.archive}
        onConfirm={handleConfirm}
        onCancel={() => { setConfirmAction(null); setSelectedId(null) }}
      />

      <ConfirmDialog
        isOpen={confirmAction === "delete"}
        title={t("common.confirm_delete_title", "shared") || "تأكيد الحذف"}
        message={t("common.confirm_delete_message", "shared") || "هل أنت متأكد من حذف هذه الإجازة؟"}
        type="danger"
        confirmLabel={t("common.delete", "shared") || "حذف"}
        cancelLabel={t("common.cancel", "shared") || "إلغاء"}
        confirmLoading={loading.delete}
        onConfirm={handleConfirm}
        onCancel={() => { setConfirmAction(null); setSelectedId(null) }}
      />
    </div>
  )
}
