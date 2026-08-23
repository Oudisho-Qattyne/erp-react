import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { useAuth } from "../../../../../core/infrastructure/auth/AuthProvider"
import { Button } from "../../../../../core/presentation/layouts/ui/buttons/Button"
import { DataTable, type ColumnDef } from "../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import { ErrorState } from "../../../../../core/presentation/layouts/ui/state/ErrorState"
import { FilterDialog, type FilterField } from "../../../../../core/presentation/layouts/ui/filter/FilterDialog"
import { Dialog } from "../../../../../core/presentation/layouts/ui/dialog/Dialog"
import { useLeaveRequest } from "../../hooks/leaveRequest/useLeaveRequest"
import { useLeaveTypes } from "../../hooks/leave/useLeaveTypes"
import { EmployeePickerDialog } from "../../components/employee/EmployeePickerDialog"
import { LeaveTypePickerDialog } from "../../components/leaveTypes/LeaveTypePickerDialog"
import type { LeaveRequest } from "../../../domain/entities/leaveRequest/leaveRequest"
import type { EmployeeListItem } from "../../../domain/entities/EmployeeListItem"
import type { EntityWithNameOnly } from "../../../../../core/domain/entities/EntityWithNameOnly"
import Input from "../../../../../core/presentation/layouts/ui/inputs/Input"
import { inputBaseClasses } from "../../../../../core/presentation/layouts/ui/inputs/styles"
import type { UseFormReturn } from "react-hook-form"
import { AuditLog } from "../../../../../core/presentation/layouts/ui/auditLogs/AuditLog"
import { CreateEmployeeLeaveRequestDialog } from "./CreateEmployeeLeaveRequestDialog"
import { User, X, FileText, Filter, Search, Eye, Check, X as XIcon, History, Plus } from "lucide-react"

const PENDING_STATUS = "pending"

const statusStyles: Record<string, string> = {
    pending: "bg-warning/10 text-warning border-warning/20",
    approved: "bg-success/10 text-success border-success/20",
    rejected: "bg-danger/10 text-danger border-danger/20",
    cancelled: "bg-gray-100 text-gray-500 border-gray-200",
}

const LEAVE_REQUEST_STATUSES = ["draft", "pending", "approved", "rejected", "cancelled"]

export const EmployeeLeaveRequests = () => {
    const { t, language } = useLanguage()
    const { hasPermission } = useAuth()
    const { employeeLeaveRequests, findAllEmployeeLeaveRequests, loading, error, pagination, filter, setPage, setFilter, resetFilter, setSearch, setSort, processLeaveRequest } = useLeaveRequest()

    const { items: leaveTypes } = useLeaveTypes()
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [localSearch, setLocalSearch] = useState<string>("")
    const [processAction, setProcessAction] = useState<{ id: number; action: "approve" | "reject" } | null>(null)
    const [reviewNotes, setReviewNotes] = useState<string>("")
    const [employeePickerOpen, setEmployeePickerOpen] = useState(false)
    const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>("")
    const [leaveTypePickerOpen, setLeaveTypePickerOpen] = useState(false)
    const [selectedLeaveTypeName, setSelectedLeaveTypeName] = useState<string | undefined>("")
    const [auditItem, setAuditItem] = useState<LeaveRequest | null>(null)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const formRef = useRef<UseFormReturn | null>(null)
    const handleSearch = () => setSearch(localSearch)

    const getLeaveTypeName = (row: LeaveRequest) => {
        if (row.leave_type?.name) {
            const n = row.leave_type.name
            return typeof n === "string" ? n : language === "ar" ? n.ar : n.en
        }
        return `#${row.leave_type_id}`
    }

    const handleEmployeePicked = (employees: EmployeeListItem[]) => {
        const emp = employees[0]
        if (emp) {
            setSelectedEmployeeName(emp.full_name)
            formRef.current?.setValue("employee_id", String(emp.id))
        }
        setEmployeePickerOpen(false)
    }

    const getLocalizedTypeName = (lt: EntityWithNameOnly) =>
        typeof lt.name === "string" ? lt.name : language === "ar" ? lt.name.ar : lt.name.en

    const handleTranslateValues = (field: string, value: string) => {
        if (field === "status") {
            return t(`leave_request.status_${value}`, "hr") || value
        }
        if (value === "true") return t("common.yes", "shared") || "Yes"
        if (value === "false") return t("common.no", "shared") || "No"
        return value
    }

    const handleLeaveTypePicked = (types: EntityWithNameOnly[]) => {
        const lt = types[0]
        if (lt) {
            setSelectedLeaveTypeName(getLocalizedTypeName(lt))
            formRef.current?.setValue("leave_type_id", String(lt.id))
        }
        setLeaveTypePickerOpen(false)
    }

    const handleProcess = async () => {
        if (!processAction) return
        try {
            await processLeaveRequest(processAction.id, processAction.action, reviewNotes)
            setProcessAction(null)
            setReviewNotes("")
            findAllEmployeeLeaveRequests()
        } catch {
            setProcessAction(null)
        }
    }

    const handleCancelProcess = () => {
        setProcessAction(null)
        setReviewNotes("")
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
            }
        },
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
            }
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
        findAllEmployeeLeaveRequests()
    }, [filter])

    const columns: ColumnDef<LeaveRequest>[] = [
        { key: "id", label: "#", width: 60 },
        { key: "employee", label: t("leave_request.employee_name", "hr") || "Employee", width: 160, render : (row) => row.employee?.full_name },
        {
            key: "leave_type",
            label: t("leave_request.leave_type", "hr") || "Leave Type",
            width: 160,
            render: (row) => getLeaveTypeName(row),
        },
        { key: "start_date", label: t("leave_request.start_date", "hr") || "Start Date", width: 120, sortable: true },
        { key: "end_date", label: t("leave_request.end_date", "hr") || "End Date", width: 120, sortable: true },
        { key: "requested_units", label: t("leave_request.units", "hr") || "Units", width: 80, align: "center", sortable: true },
        {
            key: "status",
            label: t("leave_request.status", "hr") || "Status",
            width: 110,
            sortable: true,
            render: (row) => (
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${statusStyles[row.status] || ""}`}>
                    {t(`leave_request.status_${row.status}`, "hr") || row.status}
                </span>
            ),
        },
        { key: "created_at", label: t("leave_request.created_at", "hr") || "Created At", width: 160, align: "center", sortable: true, render: (row) => row.created_at || "—" },
        { key: "submitted_at", label: t("leave_request.submitted_at", "hr") || "Submitted At", width: 160, align: "center", sortable: true, render: (row) => row.submitted_at || "—" },
        { key: "reason", label: t("leave_request.reason", "hr") || "Reason", width: 200 },
        {
            key: "actions",
            label: t("common.actions", "shared") || "Actions",
            width: 200,
            align: "center",
            render: (row) => (
                <div className="flex items-center justify-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); window.open(`/hr/employee-leave-requests/${row.id}` , "_blank") }}
                            title={t("common.view", "shared") || "View"}
                            requiredPermission="hr.leave-requests.list"
                    >
                        <Eye size={16} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setAuditItem(row) }}
                        title={t("leave_request.edit_log", "hr") || "Edit Log"}
                        requiredPermission="shared.audit-logs.view"
                    >
                        <History size={16} />
                    </Button>
                    {row.status === PENDING_STATUS && hasPermission('hr.leave-requests.manage') && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); setProcessAction({ id: row.id, action: "approve" }) }}
                                title={t("leave_request.approve", "hr") || "Approve"}
                                className="text-success hover:text-success"
                            >
                                <Check size={16} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); setProcessAction({ id: row.id, action: "reject" }) }}
                                title={t("leave_request.reject", "hr") || "Reject"}
                                className="text-danger hover:text-danger"
                            >
                                <XIcon size={16} />
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ]

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t("employee_leave_requests.title", "hr") || "Employee Leave Requests"}</h1>
                <Button variant="primary" onClick={() => setCreateDialogOpen(true)} leftIcon={<Plus size={16} />} requiredPermission="hr.leave-requests.manage">
                    {t("leave_request.new_request", "hr") || "New Request"}
                </Button>
            </div>

            {error.findAllEmployeeLeaveRequests ? (
                <ErrorState message={error.findAllEmployeeLeaveRequests} onRetry={() => findAllEmployeeLeaveRequests()} />
            ) : (
                <div className="relative w-full ">
                    <div className="relative flex gap-3 py-3">
                        <div className="relative flex-1 max-w-sm">
                            <Input
                                type="text"
                                placeholder={t("common.search", "shared") || "Search..."}
                                value={localSearch}
                                onChange={(val) => setLocalSearch(val as string)}
                                baseClasses={inputBaseClasses}
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
                        data={employeeLeaveRequests}
                        rowKey="id"
                        loading={loading.findAllEmployeeLeaveRequests}
                        sortColumn={filter.sortColumn}
                        sortOrder={filter.sortOrder}
                        onSort={setSort}
                        onRowClick={(row) => window.open(`/hr/employee-leave-requests/${row.id}` , '_blank')}
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
                </div>
            )}

            <Dialog
                isOpen={processAction !== null}
                onClose={handleCancelProcess}
                title={processAction?.action === "approve"
                    ? (t("leave_request.approve_confirm_title", "hr") || "Approve Leave Request")
                    : (t("leave_request.reject_confirm_title", "hr") || "Reject Leave Request")}
                size="md"
                actions={
                    <div className="flex items-center justify-end gap-3 w-full">
                        <Button variant="outline" onClick={handleCancelProcess}>
                            {t("common.cancel", "shared") || "Cancel"}
                        </Button>
                        <Button
                            variant={processAction?.action === "approve" ? "primary" : "danger"}
                            onClick={handleProcess}
                            isLoading={loading.processLeaveRequest}
                        >
                            {processAction?.action === "approve"
                                ? (t("leave_request.approve", "hr") || "Approve")
                                : (t("leave_request.reject", "hr") || "Reject")}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-text-muted">
                        {processAction?.action === "approve"
                            ? (t("leave_request.approve_confirm_message", "hr") || "Are you sure you want to approve this leave request?")
                            : (t("leave_request.reject_confirm_message", "hr") || "Are you sure you want to reject this leave request?")}
                    </p>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-text">
                            {t("leave_request.review_notes", "hr") || "Review Notes"}
                        </label>
                        <Input
                            type="textarea"
                            rows={4}
                            value={reviewNotes}
                            onChange={(val) => setReviewNotes(val as string)}
                            placeholder={t("leave_request.review_notes_placeholder", "hr") || "Enter review notes..."}
                            baseClasses="w-full rounded-lg border border-border bg-background px-3 py-2 text-text"
                        />
                    </div>
                </div>
            </Dialog>

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

            <AuditLog
                isOpen={!!auditItem}
                onClose={() => setAuditItem(null)}
                model="leave_request"
                modelId={auditItem?.id}
                module="hr"
                labels={{
                    title: t("leave_request.edit_log", "hr") || "Edit Log",
                    event: t("leave_request.event", "hr") || "Event",
                    created_at: t("leave_request.created_at", "hr") || "Created At",
                    changed_by: t("leave_request.changed_by", "hr") || "Changed By",
                    changes: t("leave_request.changes", "hr") || "Changes",
                    field: t("leave_request.field", "hr") || "Field",
                    old_value: t("leave_request.old_value", "hr") || "Old Value",
                    new_value: t("leave_request.new_value", "hr") || "New Value",
                    no_records: t("leave_request.no_edit_log", "hr") || "No edit logs found",
                    subject_id: t("leave_request.subject_id", "hr") || "ID",
                }}
                translateField={(key) => t(`leave_request.${key}`, "hr") || key}
                translateValues={handleTranslateValues}
            />

            <CreateEmployeeLeaveRequestDialog
                isOpen={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onSuccess={() => { findAllEmployeeLeaveRequests(); setFilter({ page: 1 }) }}
            />
        </div>
    )
}
