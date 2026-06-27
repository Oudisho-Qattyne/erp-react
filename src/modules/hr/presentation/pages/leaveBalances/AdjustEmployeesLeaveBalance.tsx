import { useState, useEffect } from "react"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { Button } from "../../../../../core/presentation/layouts/ui/buttons/Button"
import Input from "../../../../../core/presentation/layouts/ui/inputs/Input"
import { InfoRow } from "../../../../../core/presentation/layouts/ui/card/InfoRow"
import { YesNo } from "../../../../../core/presentation/layouts/ui/card/YesNo"
import { EmployeePickerDialog } from "../../components/employee/EmployeePickerDialog"
import { LeaveTypePickerDialog } from "../../components/leaveTypes/LeaveTypePickerDialog"
import { useLeaveBalance } from "../../hooks/leaveBalance/useLeaveBalance"
import { useLeaveTypes } from "../../hooks/leave/useLeaveTypes"
import { useLeaveTypeLocalization } from "../../hooks/leave/useLeaveTypeLocalization"
import type { EmployeeListItem } from "../../../domain/entities/EmployeeListItem"
import type { EntityWithNameOnly } from "../../../../../core/domain/entities/EntityWithNameOnly"
import type { AdjustLeaveBalanceDto } from "../../../application/dtos/LeaveBalance/AdjustLeaveBalanceDto"
import { User, X, Plus, Minus, FileText, Info, Calendar, Clock } from "lucide-react"

export function AdjustEmployeesLeaveBalance() {
    const { t, language } = useLanguage()
    const { adjustLeaveBalance, loading } = useLeaveBalance()
    const { currentLeave, findById, loading: leaveTypeLoading } = useLeaveTypes()
    const { getLeaveLabel } = useLeaveTypeLocalization()

    const [selectedEmployees, setSelectedEmployees] = useState<EmployeeListItem[]>([])
    const [isEmployeePickerOpen, setIsEmployeePickerOpen] = useState(false)

    const [selectedLeaveType, setSelectedLeaveType] = useState<EntityWithNameOnly | null>(null)
    const [isLeaveTypePickerOpen, setIsLeaveTypePickerOpen] = useState(false)
    const [adjustmentType, setAdjustmentType] = useState<"add" | "deduct">("add")
    const [quantity, setQuantity] = useState<number>(0)
    const [notes, setNotes] = useState("")

    useEffect(() => {
        if (selectedLeaveType) {
            findById(selectedLeaveType.id)
        }
    }, [selectedLeaveType])

    const handleEmployeePicked = (employees: EmployeeListItem[]) => {
        setSelectedEmployees((prev) => {
            const existingIds = new Set(prev.map((e) => e.id))
            const newOnes = employees.filter((e) => !existingIds.has(e.id))
            return [...prev, ...newOnes]
        })
        setIsEmployeePickerOpen(false)
    }

    const handleLeaveTypePicked = (types: EntityWithNameOnly[]) => {
        if (types.length > 0) setSelectedLeaveType(types[0])
        setIsLeaveTypePickerOpen(false)
    }

    const removeEmployee = (id: number) => {
        setSelectedEmployees((prev) => prev.filter((e) => e.id !== id))
    }

    const handleSubmit = async () => {
        if (!selectedLeaveType || quantity <= 0 || selectedEmployees.length === 0) return

        const payload: AdjustLeaveBalanceDto = {
            leave_type_id: selectedLeaveType.id,
            employee_ids: selectedEmployees.map((e) => e.id),
            adjustment_type: adjustmentType,
            quantity,
            notes: notes || undefined,
        }

        await adjustLeaveBalance(payload)
        setQuantity(0)
        setNotes("")
    }

    const isSubmitting = loading.adjustLeaveBalance

    const getLeaveTypeName = (lt: EntityWithNameOnly) =>
        typeof lt.name === "string" ? lt.name : language === "ar" ? lt.name.ar : lt.name.en

    const getLocalizedText = (text: string | { ar?: string; en?: string } | undefined) =>
        typeof text === "string" ? text : language === "ar" ? text?.ar : text?.en

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">{t("adjust_leave_balance.title", "hr") || "تعديل رصيد الإجازات"}</h1>

            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-text">
                            {t("adjust_leave_balance.employees", "hr") || "الموظفين"}
                        </label>
                        {selectedEmployees.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {selectedEmployees.map((emp) => (
                                    <span key={emp.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm border border-primary/20">
                                        <User size={14} />
                                        {emp.full_name}
                                        <button onClick={() => removeEmployee(emp.id)} className="hover:text-danger transition-colors">
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                        <Button variant="outline" onClick={() => setIsEmployeePickerOpen(true)} leftIcon={<Plus size={16} />}>
                            {t("adjust_leave_balance.select_employees", "hr") || "اختيار موظفين"}
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-text">
                            {t("leave_balance.leave_type", "hr") || "نوع الإجازة"}
                        </label>
                        {selectedLeaveType && (
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm border border-primary/20">
                                    <FileText size={14} />
                                    {getLeaveTypeName(selectedLeaveType)}
                                    <button onClick={() => { setSelectedLeaveType(null) }} className="hover:text-danger transition-colors">
                                        <X size={14} />
                                    </button>
                                </span>
                            </div>
                        )}
                        <Button variant="outline" onClick={() => setIsLeaveTypePickerOpen(true)} leftIcon={<Plus size={16} />}>
                            {t("adjust_leave_balance.select_leave_type", "hr") || "اختيار نوع الإجازة"}
                        </Button>
                    </div>
                </div>

                {currentLeave && selectedLeaveType && (
                    <div className="border border-border rounded-xl bg-background/50 p-5 space-y-4">
                        <div className="flex items-center gap-2 text-text font-semibold pb-2 border-b border-border/50">
                            <Info size={16} className="text-primary" />
                            {t("adjust_leave_balance.leave_type_details", "hr") || "تفاصيل نوع الإجازة"}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <InfoRow label={t("leave.description", "hr") || "الوصف"} value={getLocalizedText(currentLeave.description)} />
                            <InfoRow label={t("leave.unit", "hr") || "الوحدة"} value={getLeaveLabel(currentLeave, "unit")} />
                            <InfoRow label={t("leave.is_paid", "hr") || "مدفوعة"} value={<YesNo value={currentLeave.is_paid || false} />} />
                            <InfoRow label={t("leave.balance_mode", "hr") || "نظام الرصيد"} value={getLeaveLabel(currentLeave, "balance_mode")} />
                            <InfoRow label={t("leave.accrual_period", "hr") || "دورة الاستحقاق"} value={getLeaveLabel(currentLeave, "accrual_period")} />
                            <InfoRow label={t("leave.requires_approval", "hr") || "يتطلب موافقة"} value={<YesNo value={currentLeave.requires_approval || false} />} />
                            <InfoRow label={t("leave.requires_attachment", "hr") || "يتطلب مرفق"} value={<YesNo value={currentLeave.requires_attachment || false} />} />
                            <InfoRow label={t("leave.allow_carry_forward", "hr") || "ترحيل الرصيد"} value={<YesNo value={currentLeave.allow_carry_forward || false} />} />
                            <InfoRow label={t("leave.allow_half_day", "hr") || "نصف يوم"} value={<YesNo value={currentLeave.allow_half_day || false} />} />
                            <InfoRow label={t("leave.allow_hourly", "hr") || "بالساعة"} value={<YesNo value={currentLeave.allow_hourly || false} />} />
                            <InfoRow label={t("leave.allow_split", "hr") || "تجزئة"} value={<YesNo value={currentLeave.allow_split || false} />} />
                            <InfoRow label={t("leave.is_active", "hr") || "نشط"} value={<YesNo value={currentLeave.is_active || false} />} />
                        </div>
                    </div>
                )}

                {leaveTypeLoading.findById && selectedLeaveType && (
                    <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                    </div>
                )}

                <div className="border-t border-border pt-6">
                    <h2 className="text-lg font-bold text-text mb-4">{t("adjust_leave_balance.adjustment_details", "hr") || "تفاصيل التعديل"}</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-text">
                                {t("adjust_leave_balance.adjustment_type", "hr") || "نوع التعديل"}
                            </label>
                            <div className="flex gap-3">
                                <Button
                                    variant={adjustmentType === "add" ? "primary" : "outline"}
                                    onClick={() => setAdjustmentType("add")}
                                    leftIcon={<Plus size={16} />}
                                >
                                    {t("adjust_leave_balance.add", "hr") || "إضافة"}
                                </Button>
                                <Button
                                    variant={adjustmentType === "deduct" ? "primary" : "outline"}
                                    onClick={() => setAdjustmentType("deduct")}
                                    leftIcon={<Minus size={16} />}
                                >
                                    {t("adjust_leave_balance.subtract", "hr") || "خصم"}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-text">
                                {t("adjust_leave_balance.quantity", "hr") || "الكمية"}
                            </label>
                            <Input
                                type="number"
                                min={0}
                                value={quantity}
                                onChange={(val) => setQuantity(Number(val))}
                                placeholder={t("adjust_leave_balance.quantity_placeholder", "hr") || "أدخل الكمية"}
                                baseClasses="w-full rounded-lg border border-border bg-background px-3 py-2 text-text"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-text mb-2">
                            {t("adjust_leave_balance.notes", "hr") || "ملاحظات"}
                        </label>
                        <Input
                            type="textarea"
                            rows={3}
                            value={notes}
                            onChange={(val) => setNotes(val as string)}
                            placeholder={t("adjust_leave_balance.notes_placeholder", "hr") || "ملاحظات (اختياري)"}
                            baseClasses="w-full rounded-lg border border-border bg-background px-3 py-2 text-text"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={!selectedLeaveType || quantity <= 0 || selectedEmployees.length === 0 || isSubmitting}
                        isLoading={isSubmitting}
                        requiredPermission="hr.leave-balance.adjust"
                    >
                        {t("adjust_leave_balance.submit", "hr") || "تعديل الرصيد"}
                    </Button>
                </div>
            </div>

            <EmployeePickerDialog
                isOpen={isEmployeePickerOpen}
                onClose={() => setIsEmployeePickerOpen(false)}
                onConfirm={handleEmployeePicked}
                multiple={true}
                initialSelected={selectedEmployees}
            />

            <LeaveTypePickerDialog
                isOpen={isLeaveTypePickerOpen}
                onClose={() => setIsLeaveTypePickerOpen(false)}
                onConfirm={handleLeaveTypePicked}
                multiple={false}
                initialSelected={selectedLeaveType ? [selectedLeaveType] : []}
            />
        </div>
    )
}
