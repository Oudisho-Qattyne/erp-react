import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { Button } from "../../../../../core/presentation/layouts/ui/buttons/Button"
import { DataTable, type ColumnDef } from "../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import { LoadingState } from "../../../../../core/presentation/layouts/ui/state/LoadingState"
import { ErrorState } from "../../../../../core/presentation/layouts/ui/state/ErrorState"
import { ConfirmDialog } from "../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog"
import { FilterDialog, type FilterField } from "../../../../../core/presentation/layouts/ui/filter/FilterDialog"
import { useLeaveRequest } from "../../hooks/leaveRequest/useLeaveRequest"
import { LeaveTypePickerDialog } from "../../components/leaveTypes/LeaveTypePickerDialog"
import type { LeaveRequest } from "../../../domain/entities/leaveRequest/leaveRequest"
import type { EntityWithNameOnly } from "../../../../../core/domain/entities/EntityWithNameOnly"
import Input from "../../../../../core/presentation/layouts/ui/inputs/Input"
import type { UseFormReturn } from "react-hook-form"
import { Plus, Eye, Pencil, XCircle, Filter, Search, FileText, X } from "lucide-react"

const CANCELLABLE_STATUSES = [ "pending"]
const EDITABLE_STATUSES = ["pending" , "draft"]
const LEAVE_REQUEST_STATUSES = ["draft", "pending", "approved", "rejected", "cancelled"]

const statusStyles: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-danger/10 text-danger border-danger/20",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
}

export function UserLeaveRequests() {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const { myLeaveRequests, findAllMyLeaveRequests, loading, error, pagination, filter, setPage, setFilter, resetFilter, processLeaveRequest } = useLeaveRequest()
  const [cancelId, setCancelId] = useState<number | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState<string>("")
  const [leaveTypePickerOpen, setLeaveTypePickerOpen] = useState(false)
  const [selectedLeaveTypeName, setSelectedLeaveTypeName] = useState<string | undefined>("")
    const formRef = useRef<UseFormReturn | null>(null)
    const handleSearch = () => setFilter({ search: localSearch, page: 1 })

    useEffect(() => {
    findAllMyLeaveRequests()
  }, [filter])

  const getLeaveTypeName = (row: LeaveRequest) => {
    if (row.leave_type?.name) {
      const n = row.leave_type.name
      return typeof n === "string" ? n : language === "ar" ? n.ar : n.en
    }
    return `#${row.leave_type_id}`
  }

  const handleCancel = async () => {
    if (cancelId === null) return
    try {
      await processLeaveRequest(cancelId, "cancel", t("leave_request.cancelled_by_user", "hr") || "Cancelled by user")
      setCancelId(null)
      findAllMyLeaveRequests()
    } catch {
      setCancelId(null)
    }
  }

  const getLocalizedTypeName = (lt: EntityWithNameOnly) =>
    typeof lt.name === "string" ? lt.name : language === "ar" ? lt.name.ar : lt.name.en

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
      name: "leave_type_id",
      render: (form) => {
        formRef.current = form
        return (
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              {t("leave_request.leave_type", "hr") || "Leave Type"}
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
    {
      name: "status",
      label: t("leave_request.status", "hr") || "Status",
      type: "select",
      options: [
        { value: "", label: t("common.all", "shared") || "All" },
        ...LEAVE_REQUEST_STATUSES.map((s) => ({ value: s, label: t(`leave_request.status_${s}`, "hr") || s })),
      ],
    },
    { name: "from_date", label: t("leave_request.from_date", "hr") || "From", type: "date" },
    { name: "to_date", label: t("leave_request.to_date", "hr") || "To", type: "date" },
  ]

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = { page: 1, per_page: filter.per_page }
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

  const columns: ColumnDef<LeaveRequest>[] = [
    { key: "id", label: "#", width: 60 },
    {
        key: "leave_type",
        label: t("leave_request.leave_type", "hr") || "Leave Type",
        width: 160,
        render: (row) => getLeaveTypeName(row),
    },
    { key: "start_date", label: t("leave_request.start_date", "hr") || "Start Date", width: 120 },
    { key: "end_date", label: t("leave_request.end_date", "hr") || "End Date", width: 120 },
    { key: "requested_units", label: t("leave_request.units", "hr") || "Units", width: 80, align: "center" },
    {
        key: "status",
        label: t("leave_request.status", "hr") || "Status",
        width: 110,
      render: (row) => (
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${statusStyles[row.status] || ""}`}>
          {t(`leave_request.status_${row.status}`, "hr") || row.status}
        </span>
      ),
    },
    { key: "reason", label: t("leave_request.reason", "hr") || "Reason", width: 200 },
    {
      key: "actions",
      label: t("common.actions", "shared") || "Actions",
      width: 140,
      align: "center",
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); navigate(`/hr/leave-requests/${row.id}`) }}
            title={t("common.view", "shared") || "View"}
          >
            <Eye size={16} />
          </Button>
          {EDITABLE_STATUSES.includes(row.status) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); navigate(`/hr/leave-requests/${row.id}/edit`) }}
              title={t("common.edit", "shared") || "Edit"}
            >
              <Pencil size={16} />
            </Button>
          )}
          {CANCELLABLE_STATUSES.includes(row.status) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); setCancelId(row.id) }}
              title={t("common.cancel", "shared") || "Cancel"}
              className="text-danger hover:text-danger"
            >
              <XCircle size={16} />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("leave_request.my_requests", "hr") || "My Leave Requests"}</h1>
        <Button variant="primary" onClick={() => navigate("/hr/leave-requests/create")} leftIcon={<Plus size={16} />}>
          {t("leave_request.new_request", "hr") || "New Request"}
        </Button>
      </div>

      {loading.findAllMyLeaveRequests ? (
        <LoadingState />
      ) : error.findAllMyLeaveRequests ? (
        <ErrorState message={error.findAllMyLeaveRequests} onRetry={() => findAllMyLeaveRequests()} />
      ) : (
        <>
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
            <Button variant="outline" size="sm" onClick={() => { resetFilter(); setSelectedLeaveTypeName("") }}>
              {t("common.reset", "shared") || "Reset"}
            </Button>
          </div>
            <DataTable
                columns={columns}
                data={myLeaveRequests}
                rowKey="id"
                onRowClick={(row) => navigate(`/hr/leave-requests/${row.id}`)}
                emptyMessage={t("leave_request.no_data", "hr") || "No leave requests found"}
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
        </>
      )}
      <ConfirmDialog
        isOpen={cancelId !== null}
        type="alert"
        title={t("leave_request.cancel_confirm_title", "hr") || "Cancel Leave Request"}
        message={t("leave_request.cancel_confirm_message", "hr") || "Are you sure you want to cancel this leave request?"}
        confirmLabel={t("common.yes", "shared") || "Yes"}
        cancelLabel={t("common.no", "shared") || "No"}
        confirmLoading={loading.processLeaveRequest}
        onConfirm={handleCancel}
        onCancel={() => setCancelId(null)}
      />
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
