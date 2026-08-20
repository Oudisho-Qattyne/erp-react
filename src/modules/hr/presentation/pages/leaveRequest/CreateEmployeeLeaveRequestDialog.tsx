import { useState, useEffect } from "react"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { Button } from "../../../../../core/presentation/layouts/ui/buttons/Button"
import { Dialog } from "../../../../../core/presentation/layouts/ui/dialog/Dialog"
import Input from "../../../../../core/presentation/layouts/ui/inputs/Input"
import { InfoRow } from "../../../../../core/presentation/layouts/ui/card/InfoRow"
import { YesNo } from "../../../../../core/presentation/layouts/ui/card/YesNo"
import { EmployeePickerDialog } from "../../components/employee/EmployeePickerDialog"
import { LeaveTypePickerDialog } from "../../components/leaveTypes/LeaveTypePickerDialog"
import { useLeaveRequest } from "../../hooks/leaveRequest/useLeaveRequest"
import { useLeaveTypes } from "../../hooks/leave/useLeaveTypes"
import { useLeaveTypeLocalization } from "../../hooks/leave/useLeaveTypeLocalization"
import { getCreateLeaveRequestSchema } from "../../schemas/leaveRequestForm.schema"
import type { z } from "zod"
import type { EmployeeListItem } from "../../../domain/entities/EmployeeListItem"
import type { EntityWithNameOnly } from "../../../../../core/domain/entities/EntityWithNameOnly"
import { FileText, Info, X, Plus, AlertCircle, User } from "lucide-react"

type FormErrors = Partial<Record<keyof z.infer<ReturnType<typeof getCreateLeaveRequestSchema>> | "employee_id", string>>

interface CreateEmployeeLeaveRequestDialogProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

function formatDate(input: string): string {
    if (!input) return ""
    const datePart = input.split("T")[0]
    const [y, m, d] = datePart.split("-")
    return `${d}-${m}-${y}`
}

export function CreateEmployeeLeaveRequestDialog({ isOpen, onClose, onSuccess }: CreateEmployeeLeaveRequestDialogProps) {
    const { t, language } = useLanguage()
    const { createEmployeeLeaveRequest, loading } = useLeaveRequest()
    const { currentLeave, findById, loading: leaveTypeLoading } = useLeaveTypes()
    const { getLeaveLabel } = useLeaveTypeLocalization()

    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeListItem | null>(null)
    const [isEmployeePickerOpen, setIsEmployeePickerOpen] = useState(false)
    const [selectedLeaveType, setSelectedLeaveType] = useState<EntityWithNameOnly | null>(null)
    const [isLeaveTypePickerOpen, setIsLeaveTypePickerOpen] = useState(false)
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [requestedUnits, setRequestedUnits] = useState(0)
    const [reason, setReason] = useState("")
    const [errors, setErrors] = useState<FormErrors>({})

    useEffect(() => {
        if (isOpen) {
            setSelectedEmployee(null)
            setSelectedLeaveType(null)
            setStartDate("")
            setEndDate("")
            setRequestedUnits(0)
            setReason("")
            setErrors({})
        }
    }, [isOpen])

    useEffect(() => {
        if (selectedLeaveType) {
            findById(selectedLeaveType.id)
        }
    }, [selectedLeaveType])

    const handleEmployeePicked = (employees: EmployeeListItem[]) => {
        if (employees.length > 0) {
            setSelectedEmployee(employees[0])
            setErrors((prev) => ({ ...prev, employee_id: undefined }))
        }
        setIsEmployeePickerOpen(false)
    }

    const handleLeaveTypePicked = (types: EntityWithNameOnly[]) => {
        if (types.length > 0) {
            setSelectedLeaveType(types[0])
            setErrors((prev) => ({ ...prev, leave_type_id: undefined }))
        }
        setIsLeaveTypePickerOpen(false)
    }

    const getLeaveTypeName = (lt: EntityWithNameOnly) =>
        typeof lt.name === "string" ? lt.name : language === "ar" ? lt.name.ar : lt.name.en

    const getLocalizedText = (text: string | { ar?: string; en?: string } | undefined) =>
        typeof text === "string" ? text : language === "ar" ? text?.ar : text?.en

    const handleSubmit = async () => {
        setErrors({})

        if (!selectedEmployee) {
            setErrors((prev) => ({
                ...prev,
                employee_id: t("leave_request.validation.employee_required", "hr") || "Employee is required",
            }))
            return
        }

        const schema = getCreateLeaveRequestSchema(t)
        const result = schema.safeParse({
            leave_type_id: selectedLeaveType?.id,
            start_date: startDate,
            end_date: endDate,
            requested_units: requestedUnits,
            reason: reason || undefined,
        })

        if (!result.success) {
            const fieldErrors: FormErrors = {}
            for (const issue of result.error.issues) {
                const path = issue.path[0] as keyof FormErrors
                if (path && !fieldErrors[path]) {
                    fieldErrors[path] = issue.message
                }
            }
            setErrors(fieldErrors)
            return
        }

        await createEmployeeLeaveRequest({
            employee_id: selectedEmployee.id,
            leave_type_id: selectedLeaveType!.id,
            start_date: formatDate(startDate),
            end_date: formatDate(endDate),
            requested_units: requestedUnits,
            reason,
        })

        onSuccess()
        onClose()
    }

    const isSubmitting = loading.createEmployeeLeaveRequest
    const canSubmit = selectedEmployee && selectedLeaveType && startDate && endDate && requestedUnits > 0 && reason

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={t("leave_request.create_for_employee_title", "hr") || "Create Leave Request for Employee"}
            size="2xl"
        >
            <div className="space-y-6">
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-text">
                        {t("leave_request.employee_name", "hr") || "Employee"}
                    </label>
                    {selectedEmployee ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm border border-primary/20">
                            <User size={14} />
                            {selectedEmployee.full_name}
                            <button onClick={() => { setSelectedEmployee(null); setErrors((prev) => ({ ...prev, employee_id: undefined })) }} className="hover:text-danger transition-colors">
                                <X size={14} />
                            </button>
                        </span>
                    ) : (
                        <Button variant="outline" onClick={() => setIsEmployeePickerOpen(true)} leftIcon={<Plus size={16} />}>
                            {t("leave_request.select_employee", "hr") || "Select Employee"}
                        </Button>
                    )}
                    {errors.employee_id && (
                        <p className="flex items-center gap-1 text-xs text-danger mt-1"><AlertCircle size={12} />{errors.employee_id}</p>
                    )}
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-medium text-text">
                        {t("leave_balance.leave_type", "hr") || "Leave Type"}
                    </label>
                    {selectedLeaveType ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm border border-primary/20">
                            <FileText size={14} />
                            {getLeaveTypeName(selectedLeaveType)}
                            <button onClick={() => { setSelectedLeaveType(null); setErrors((prev) => ({ ...prev, leave_type_id: undefined })) }} className="hover:text-danger transition-colors">
                                <X size={14} />
                            </button>
                        </span>
                    ) : (
                        <Button variant="outline" onClick={() => setIsLeaveTypePickerOpen(true)} leftIcon={<Plus size={16} />}>
                            {t("leave_request.select_leave_type", "hr") || "Select Leave Type"}
                        </Button>
                    )}
                    {errors.leave_type_id && (
                        <p className="flex items-center gap-1 text-xs text-danger mt-1"><AlertCircle size={12} />{errors.leave_type_id}</p>
                    )}
                </div>

                {currentLeave && selectedLeaveType && (
                    <div className="border border-border rounded-xl bg-background/50 p-5 space-y-4">
                        <div className="flex items-center gap-2 text-text font-semibold pb-2 border-b border-border/50">
                            <Info size={16} className="text-primary" />
                            {t("adjust_leave_balance.leave_type_details", "hr") || "Leave Type Details"}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <InfoRow label={t("leave.description", "hr") || "Description"} value={getLocalizedText(currentLeave.description)} />
                            <InfoRow label={t("leave.unit", "hr") || "Unit"} value={getLeaveLabel(currentLeave, "unit")} />
                            <InfoRow label={t("leave.is_paid", "hr") || "Paid"} value={<YesNo value={currentLeave.is_paid || false} />} />
                            <InfoRow label={t("leave.requires_approval", "hr") || "Requires Approval"} value={<YesNo value={currentLeave.requires_approval || false} />} />
                            <InfoRow label={t("leave.allow_half_day", "hr") || "Half Day"} value={<YesNo value={currentLeave.allow_half_day || false} />} />
                            <InfoRow label={t("leave.allow_hourly", "hr") || "Hourly"} value={<YesNo value={currentLeave.allow_hourly || false} />} />
                            <InfoRow label={t("leave.allow_split", "hr")} value={<YesNo value={currentLeave.allow_split} />} />
                            <InfoRow label={t("common.is_active", "shared")} value={<YesNo value={currentLeave.is_active} />} />
                        </div>
                    </div>
                )}

                {leaveTypeLoading.findById && selectedLeaveType && (
                    <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                    </div>
                )}

                <div className="border-t border-border pt-6">
                    <h2 className="text-lg font-bold text-text mb-4">{t("leave_request.request_details", "hr") || "Request Details"}</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-text">
                                {t("leave_request.start_date", "hr") || "Start Date & Time"}
                            </label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(val) => { setStartDate(val as string); setErrors((prev) => ({ ...prev, start_date: undefined })) }}
                                baseClasses="w-full rounded-lg border border-border bg-background px-3 py-2 text-text"
                            />
                            {errors.start_date && (
                                <p className="flex items-center gap-1 text-xs text-danger mt-1"><AlertCircle size={12} />{errors.start_date}</p>
                            )}
                        </div>
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-text">
                                {t("leave_request.end_date", "hr") || "End Date & Time"}
                            </label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(val) => { setEndDate(val as string); setErrors((prev) => ({ ...prev, end_date: undefined })) }}
                                baseClasses="w-full rounded-lg border border-border bg-background px-3 py-2 text-text"
                            />
                            {errors.end_date && (
                                <p className="flex items-center gap-1 text-xs text-danger mt-1"><AlertCircle size={12} />{errors.end_date}</p>
                            )}
                        </div>
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-text">
                                {t("leave_request.requested_units", "hr") || "Requested Units"}
                            </label>
                            <Input
                                type="number"
                                min={1}
                                value={requestedUnits}
                                onChange={(val) => { setRequestedUnits(Number(val)); setErrors((prev) => ({ ...prev, requested_units: undefined })) }}
                                placeholder={t("leave_request.requested_units_placeholder", "hr") || "Enter number of units"}
                                baseClasses="w-full rounded-lg border border-border bg-background px-3 py-2 text-text"
                            />
                            {errors.requested_units && (
                                <p className="flex items-center gap-1 text-xs text-danger mt-1"><AlertCircle size={12} />{errors.requested_units}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-text mb-2">
                            {t("leave_request.reason", "hr") || "Reason"}
                        </label>
                        <Input
                            type="textarea"
                            rows={4}
                            value={reason}
                            onChange={(val) => { setReason(val as string); setErrors((prev) => ({ ...prev, reason: undefined })) }}
                            placeholder={t("leave_request.reason_placeholder", "hr") || "Enter the reason for your leave request"}
                            baseClasses="w-full rounded-lg border border-border bg-background px-3 py-2 text-text"
                        />
                        {errors.reason && (
                            <p className="flex items-center gap-1 text-xs text-danger mt-1"><AlertCircle size={12} />{errors.reason}</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button variant="outline" onClick={onClose}>
                        {t("common.cancel", "shared") || "Cancel"}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={!canSubmit || isSubmitting}
                        isLoading={isSubmitting}
                    >
                        {t("leave_request.submit", "hr") || "Submit Request"}
                    </Button>
                </div>
            </div>

            <EmployeePickerDialog
                isOpen={isEmployeePickerOpen}
                onClose={() => setIsEmployeePickerOpen(false)}
                onConfirm={handleEmployeePicked}
                multiple={false}
            />

            <LeaveTypePickerDialog
                eligible={false}
                isOpen={isLeaveTypePickerOpen}
                onClose={() => setIsLeaveTypePickerOpen(false)}
                onConfirm={handleLeaveTypePicked}
                multiple={false}
                initialSelected={selectedLeaveType ? [selectedLeaveType] : []}
            />
        </Dialog>
    )
}