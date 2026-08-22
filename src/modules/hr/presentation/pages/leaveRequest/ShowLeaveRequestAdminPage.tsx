import { useEffect, useState, useCallback, useRef, type ReactNode } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { useAuth } from "../../../../../core/infrastructure/auth/AuthProvider"
import { useLeaveRequest } from "../../hooks/leaveRequest/useLeaveRequest"
import { useLeaveTypes } from "../../hooks/leave/useLeaveTypes"
import { useLeaveTypeLocalization } from "../../hooks/leave/useLeaveTypeLocalization"
import { useLeaveBalance } from "../../hooks/leaveBalance/useLeaveBalance"
import { useManageEmployee } from "../../hooks/useEmployees"
import { Button } from "../../../../../core/presentation/layouts/ui/buttons/Button"
import { LoadingState } from "../../../../../core/presentation/layouts/ui/state/LoadingState"
import { ErrorState } from "../../../../../core/presentation/layouts/ui/state/ErrorState"
import { SectionCard } from "../../../../../core/presentation/layouts/ui/card/SectionCard"
import { InfoRow } from "../../../../../core/presentation/layouts/ui/card/InfoRow"
import { YesNo } from "../../../../../core/presentation/layouts/ui/card/YesNo"
import { DataTable, type ColumnDef } from "../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import { FilterDialog, type FilterField } from "../../../../../core/presentation/layouts/ui/filter/FilterDialog"
import { LeaveTypePickerDialog } from "../../components/leaveTypes/LeaveTypePickerDialog"
import { CreateEmployeeLeaveRequestDialog } from "./CreateEmployeeLeaveRequestDialog"
import { Dialog } from "../../../../../core/presentation/layouts/ui/dialog/Dialog"
import Input from "../../../../../core/presentation/layouts/ui/inputs/Input"
import { inputBaseClasses } from "../../../../../core/presentation/layouts/ui/inputs/styles"
import { RuleGroupComponent } from "../../components/leaveRules/RuleGroupComponent"
import { getEligibilityFields } from "../../utils/RulesFields"
import { getLocalizedName } from "../../../../../core/presentation/utils/helpes"
import { ArrowRight, Check, X, Pencil, CheckCircle2, XCircle, User, Briefcase, GraduationCap, HeartPulse, Users, FileText, Filter, Search } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import type { LeaveRequest } from "../../../domain/entities/leaveRequest/leaveRequest"
import type { Leave, FixedGrantCase, RuleCondition, RuleGroup } from "../../../domain/entities/leave/leave"
import type { EmployeeData } from "../../../domain/entities/employee"
import type { EntityWithNameOnly } from "../../../../../core/domain/entities/EntityWithNameOnly"
import type { UseFormReturn } from "react-hook-form"

interface RuleFieldValues {
  [field: string]: string
}

const OPERATOR_LABELS: Record<string, string> = {
  "=": "=",
  "!=": "≠",
  ">": ">",
  ">=": "≥",
  "<": "<",
  "<=": "≤",
  in: "∈",
  between: "between",
  contains: "contains",
}

function ageFromDate(dateStr: string | undefined): number | null {
  if (!dateStr) return null
  const birth = new Date(dateStr)
  if (isNaN(birth.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
}

const evalRuleCondition = (cond: RuleCondition, values: RuleFieldValues): boolean => {
  const raw = values[cond.field]
  const empVal = raw ?? ""
  const ruleVal = (cond.value ?? "").trim()
  switch (cond.operator) {
    case "=": return String(empVal) === ruleVal
    case "!=": return String(empVal) !== ruleVal
    case ">": return Number(empVal) > Number(ruleVal)
    case ">=": return Number(empVal) >= Number(ruleVal)
    case "<": return Number(empVal) < Number(ruleVal)
    case "<=": return Number(empVal) <= Number(ruleVal)
    case "contains": return String(empVal).toLowerCase().includes(ruleVal.toLowerCase())
    case "in": return ruleVal.split(",").map((v) => v.trim()).includes(String(empVal))
    case "between": {
      const [a, b] = ruleVal.split(",").map(Number)
      const n = Number(empVal)
      return !isNaN(a) && !isNaN(b) && !isNaN(n) && n >= a && n <= b
    }
    default: return false
  }
}

const evalRuleGroup = (group: RuleGroup, values: RuleFieldValues): boolean => {
  const results = group.conditions.map((c) => (c.type === "group" ? evalRuleGroup(c, values) : evalRuleCondition(c, values)))
  return group.operator === "OR" ? results.some(Boolean) : results.every(Boolean)
}

const LEAVE_REQUEST_STATUSES = ["draft", "pending", "approved", "rejected", "cancelled"]

const statusStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600 border-gray-300",
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-danger/10 text-danger border-danger/20",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
}

export function ShowLeaveRequestAdminPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, language, direction } = useLanguage()
  const { hasPermission } = useAuth()
  const { currentLeaveRequest, findLeaveRequestById, loading, error, processLeaveRequest, employeeLeaveRequests, findAllEmployeeLeaveRequests, pagination, filter, setPage, setFilter, resetFilter, setSearch } = useLeaveRequest()
  const { currentLeave: leaveType, findById: findLeaveTypeById, loading: leaveTypesLoading, error: leaveTypesError } = useLeaveTypes()
  const { getLeaveLabel } = useLeaveTypeLocalization()
  const { employeeLeaveBalances: leaveBalances, findAllEmployeeLeaveBalances, loading: balanceLoading, error: balanceError } = useLeaveBalance()
  const { getById } = useManageEmployee()
  const [employee, setEmployee] = useState<EmployeeData | null>(null)
  const [employeeLoading, setEmployeeLoading] = useState(false)
  const [employeeError, setEmployeeError] = useState<string | null>(null)
  const [processAction, setProcessAction] = useState<"approve" | "reject" | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState<string>("")
  const [leaveTypePickerOpen, setLeaveTypePickerOpen] = useState(false)
  const [selectedLeaveTypeName, setSelectedLeaveTypeName] = useState<string>("")
  const formRef = useRef<UseFormReturn | null>(null)

  const loadEmployee = useCallback(async (employeeId: number) => {
    setEmployeeLoading(true)
    setEmployeeError(null)
    try {
      const res = await getById(employeeId)
      setEmployee(res?.data ?? null)
    } catch (err: any) {
      setEmployeeError(typeof err === "string" ? err : (err?.message || "Failed to load employee"))
    } finally {
      setEmployeeLoading(false)
    }
  }, [getById])

  useEffect(() => {
    if (id) findLeaveRequestById(Number(id))
  }, [id])

  useEffect(() => {
    const employeeId = currentLeaveRequest?.employee_id
    if (employeeId !== undefined) {
      findAllEmployeeLeaveRequests(employeeId)
      findAllEmployeeLeaveBalances(employeeId)
      loadEmployee(employeeId)
    }
  }, [currentLeaveRequest?.employee_id])

  useEffect(() => {
    const employeeId = currentLeaveRequest?.employee_id
    if (employeeId !== undefined) findAllEmployeeLeaveRequests(employeeId)
  }, [filter])

  useEffect(() => {
    const ltId = currentLeaveRequest?.leave_type_id
    if (ltId !== undefined && (filter.leave_type_id === undefined || filter.leave_type_id === null)) {
      setFilter((prev) => ({ ...prev, page: 1, leave_type_id: ltId }))
      setSelectedLeaveTypeName(getLeaveTypeName())
    }
  }, [currentLeaveRequest?.leave_type_id, currentLeaveRequest, filter.leave_type_id])

  useEffect(() => {
    const leaveTypeId = currentLeaveRequest?.leave_type_id
    if (leaveTypeId !== undefined) findLeaveTypeById(leaveTypeId)
  }, [currentLeaveRequest?.leave_type_id])

  const handleProcess = async () => {
    if (!processAction || !id) return
    try {
      await processLeaveRequest(Number(id), processAction, reviewNotes)
      setProcessAction(null)
      setReviewNotes("")
      findLeaveRequestById(Number(id))
    } catch {
      setProcessAction(null)
    }
  }

  if (loading.findLeaveRequestById) return <LoadingState message={t("common.loading", "shared")} />
  if (error.findLeaveRequestById || !currentLeaveRequest) {
    return (
      <ErrorState
        message={error.findLeaveRequestById || t("common.not_found", "shared")}
        onRetry={() => navigate("/hr/employee-leave-requests")}
        retryLabel={t("common.back_to_list", "shared")}
      />
    )
  }

  const lr = currentLeaveRequest
  const getLeaveTypeName = (): string => {
    if (lr.leave_type?.name) {
      const n = lr.leave_type.name
      return typeof n === "string" ? n : (language === "ar" ? n.ar : n.en) || n.en || n.ar || `#${lr.leave_type_id}`
    }
    return `#${lr.leave_type_id}`
  }

  const leaveName = (row: LeaveRequest) => {
    if (row.leave_type?.name) {
      const n = row.leave_type.name
      return typeof n === "string" ? n : language === "ar" ? n.ar : n.en
    }
    return `#${row.leave_type_id}`
  }

  const historyColumns: ColumnDef<LeaveRequest>[] = [
    { key: "id", label: "#", width: 60 },
    { key: "leave_type", label: t("leave_request.leave_type", "hr") || "Leave Type", width: 160, render: leaveName },
    { key: "start_date", label: t("leave_request.start_date", "hr") || "Start Date", width: 130 },
    { key: "end_date", label: t("leave_request.end_date", "hr") || "End Date", width: 130 },
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
  ]

  const historyRows = employeeLeaveRequests.filter((r) => r.id !== lr.id)

  const getLocalizedTypeName = (lt: EntityWithNameOnly) =>
    typeof lt.name === "string" ? lt.name : (language === "ar" ? lt.name.ar : lt.name.en) || lt.name.en || lt.name.ar || ""

  const handleLeaveTypePicked = (types: EntityWithNameOnly[]) => {
    const lt = types[0]
    if (lt) {
      setSelectedLeaveTypeName(getLocalizedTypeName(lt))
      formRef.current?.setValue("leave_type_id", String(lt.id))
    }
    setLeaveTypePickerOpen(false)
  }

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = { page: 1, per_page: filter.per_page }
    for (const [key, val] of Object.entries(values)) {
      if (val === "" || val === undefined) continue
      if (key === "leave_type_id") parsed[key] = Number(val)
      else parsed[key] = val
    }
    setFilter(() => parsed as any)
    setIsFilterOpen(false)
  }

  const handleSearch = () => setSearch(localSearch)

  const filterFields: FilterField[] = [
    {
      name: "leave_type_id",
      render: (form) => {
        formRef.current = form
        return (
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              {t("leave_request.select_leave_type", "hr") || "Leave Type"}
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

  const eligibilityFields = getEligibilityFields(t)
  const isBand = leaveType?.entitlement_rules?.type === "bands"
  const leaveBalance = leaveBalances.find((b) => b.leave_type_id === lr.leave_type_id)
  const donutData = leaveBalance
    ? [
        { name: t("leave_balance.available", "hr"), value: Math.max(0, leaveBalance.available_units), color: "var(--color-success)" },
        { name: t("leave_balance.consumed", "hr"), value: Math.max(0, leaveBalance.consumed_units * -1), color: "var(--color-danger)" },
      ].filter((d) => d.value > 0)
    : []

  const employeeAge = ageFromDate(employee?.date_birth)
  const yearsOfService = ageFromDate(employee?.employment_details?.appointment_date)
  const contractTypeRaw = (employee?.employment_details?.job_category || "").toLowerCase().trim().replace(/-/g, "_").replace(/\s+/g, "_")
  const employeeContractType = ["permanent", "contract", "part_time"].includes(contractTypeRaw) ? contractTypeRaw : ""
  const employeeRuleValues: RuleFieldValues = employee
    ? {
        employee_age: employeeAge !== null ? String(employeeAge) : "",
        employee_gender: employee.gender || "",
        employee_number_of_children: String(employee.number_of_children ?? 0),
        employee_years_of_service: yearsOfService !== null ? String(yearsOfService) : "",
        employee_marital_status: employee.marital_status || "",
        employee_job_title: employee.employment_details?.job_title || "",
        employee_contract_type: employeeContractType,
      }
    : {}

  const isEligible = leaveType?.eligibility_rules ? evalRuleGroup(leaveType.eligibility_rules, employeeRuleValues) : null
  const hasEligibilityRules = !!leaveType?.eligibility_rules?.conditions?.length

  const localizeRuleValue = (field: string, val: string) => {
    const f = eligibilityFields.find((x) => x.value === field)
    if (f?.type === "select") return f.options?.find((o) => o.value === val)?.label || val
    return val
  }

  const renderEligibilityNode = (node: RuleCondition | RuleGroup, depth: number): ReactNode => {
    if (node.type === "condition") {
      const passed = evalRuleCondition(node, employeeRuleValues)
      const field = eligibilityFields.find((f) => f.value === node.field)
      const empVal = employeeRuleValues[node.field]
      return (
        <div
          className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/40 p-2.5 flex-wrap"
          style={{ marginInlineStart: depth * 20 }}
        >
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-text">{field?.label || node.field}</span>
            <span className="text-text-muted">{OPERATOR_LABELS[node.operator] || node.operator}</span>
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">
              {localizeRuleValue(node.field, node.value)}
            </span>
            <span className="text-text-muted">→</span>
            <span className={`font-semibold ${passed ? "text-success" : "text-danger"}`}>
              {empVal ? localizeRuleValue(node.field, empVal) : "-"}
            </span>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
              passed ? "bg-success/10 text-success border-success/20" : "bg-danger/10 text-danger border-danger/20"
            }`}
          >
            {passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            {passed
              ? t("leave_request.condition_passed", "hr")
              : t("leave_request.condition_failed", "hr")}
          </span>
        </div>
      )
    }
    return (
      <div className="space-y-2" style={{ marginInlineStart: depth * 16 }}>
        <span
          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
            node.operator === "OR" ? "bg-warning/10 text-warning border-warning/20" : "bg-primary/10 text-primary border-primary/20"
          }`}
        >
          {node.operator === "OR" ? "OR" : "AND"}
        </span>
        <div className="space-y-2">
          {node.conditions.map((c, i) => (
            <div key={i}>{renderEligibilityNode(c, depth + 1)}</div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 p-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate("/hr/employee-leave-requests")}
          leftIcon={<ArrowRight size={18} className={direction === "rtl" ? "rotate-180" : ""} />}
          className="text-text-muted hover:text-text"
        >
          {t("common.back", "shared")}
        </Button>
        {lr.status === "pending" && hasPermission('hr.leave-requests.manage') && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              leftIcon={<Pencil size={16} />}
              onClick={() => setEditDialogOpen(true)}
            >
              {t("common.edit", "shared")}
            </Button>
            <Button
              variant="primary"
              leftIcon={<Check size={16} />}
              onClick={() => setProcessAction("approve")}
              isLoading={loading.processLeaveRequest}
            >
              {t("leave_request.approve", "hr")}
            </Button>
            <Button
              variant="danger"
              leftIcon={<X size={16} />}
              onClick={() => setProcessAction("reject")}
              isLoading={loading.processLeaveRequest}
            >
              {t("leave_request.reject", "hr")}
            </Button>
          </div>
        )}
      </div>

      <div className="bg-card/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-border shadow-sm">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary via-primary-light to-primary opacity-70" />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text">
              {t("leave_request.request_details", "hr")} #{lr.id}
            </h1>
            {lr.employee && (
              <p className="text-text-muted mt-1">{lr.employee.full_name}</p>
            )}
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[lr.status] || ""}`}>
            {t(`leave_request.status_${lr.status}`, "hr") || lr.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title={t("leave_request.request_details", "hr")}>
          <div className="space-y-4">
            <InfoRow label={t("leave_request.leave_type", "hr")} value={getLeaveTypeName()} />
            <InfoRow label={t("leave_request.start_date", "hr")} value={lr.start_date} />
            <InfoRow label={t("leave_request.end_date", "hr")} value={lr.end_date} />
            <InfoRow label={t("leave_request.requested_units", "hr")} value={lr.requested_units} />
            <InfoRow label={t("leave_request.reason", "hr")} value={lr.reason || "-"} />
          </div>
        </SectionCard>

        <SectionCard title={t("leave_request.review_notes", "hr")}>
          <div className="space-y-4">
            <InfoRow label={t("leave_request.review_notes", "hr")} value={lr.review_notes || "-"} />
          </div>
        </SectionCard>
      </div>

      <SectionCard title={t("leave_balance.balance", "hr")}>
        {balanceLoading.findAllEmployeeLeaveBalances ? (
          <p className="text-sm text-text-muted">{t("common.loading", "shared")}</p>
        ) : balanceError.findAllEmployeeLeaveBalances ? (
          <p className="text-sm text-danger">{balanceError.findAllEmployeeLeaveBalances}</p>
        ) : leaveBalance ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* <InfoRow
                label={t("leave_balance.leave_type", "hr")}
                value={leaveBalance.leave_type_name || getLeaveTypeName()}
              /> */}
             
              {/* <InfoRow label={t("leave_balance.entitled", "hr")} value={leaveBalance.entitled_units} /> */}
            </div>

            {donutData.length > 0 ? (
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-48 h-48 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={88}
                        paddingAngle={3}
                        strokeWidth={0}
                        startAngle={90}
                        endAngle={-270}
                      >
                        {donutData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-text">{leaveBalance.available_units}</span>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">
                      {t("leave_balance.available", "hr")}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 flex-1 w-full">
                  {donutData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs font-semibold text-text-muted">{entry.name}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-text">{entry.value}</span>
                        {leaveBalance.entitled_units > 0 && (
                          <span className="text-[10px] text-text-muted">
                            ({Math.round((entry.value / (leaveBalance.available_units - leaveBalance.consumed_units)) * 100)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="border-t border-border/60 pt-5">
              <p className="text-sm font-semibold text-text-muted mb-3">
                {t("leave_balance.overview", "hr") || "Overview"}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <InfoRow label={t("leave_balance.entitled", "hr")} value={leaveBalance.entitled_units} />
                <InfoRow label={t("leave_balance.consumed", "hr")} value={leaveBalance.consumed_units} />
                <InfoRow label={t("leave_balance.available", "hr")} value={leaveBalance.available_units} />
                <InfoRow label={t("leave_balance.carried_forward", "hr")} value={leaveBalance.carried_forward_units} />
                <InfoRow label={t("leave_balance.adjustment_added", "hr")} value={leaveBalance.adjustment_added_units} />
                <InfoRow label={t("leave_balance.adjustment_deducted", "hr")} value={leaveBalance.adjustment_deducted_units} />
                {/* <InfoRow label={t("leave_balance.system_correction_added", "hr")} value={leaveBalance.system_correction_added_units} /> */}
                {/* <InfoRow label={t("leave_balance.system_correction_deducted", "hr")} value={leaveBalance.system_correction_deducted_units} /> */}
                 <InfoRow
                label={t("leave_balance.accrual_period", "hr")}
                value={leaveBalance.accrual_period === "month"
                  ? t("leave_balance.monthly", "hr")
                  : t("leave_balance.yearly", "hr")}
              />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-muted">{t("leave_balance.no_data", "hr")}</p>
        )}
      </SectionCard>


   
<div className="relative w-full flex gap-4">

      <SectionCard className="flex-1 " title={t("leave_request.leave_type_details", "hr")}>
        {leaveTypesLoading.findById ? (
          <p className="text-sm text-text-muted">{t("common.loading", "shared")}</p>
        ) : leaveType ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-text">{leaveType.name as string}</h3>
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                {leaveType.unit === "day" ? t("leave.unit_day", "hr") : t("leave.unit_hour", "hr")}
              </span>
            </div>

            <div className="space-y-4">
              <InfoRow label={t("leave.description", "hr")} value={leaveType.description} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoRow label={t("leave.unit", "hr")} value={getLeaveLabel(leaveType, "unit")} />
                <InfoRow label={t("leave.min_request_units", "hr")} value={leaveType.min_request_units} />
                <InfoRow label={t("leave.max_request_units", "hr")} value={leaveType.max_request_units} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InfoRow label={t("leave.is_paid", "hr")} value={<YesNo value={leaveType.is_paid} />} />
              <InfoRow label={t("leave.requires_attachment", "hr")} value={<YesNo value={leaveType.requires_attachment} />} />
              <InfoRow label={t("leave.requires_approval", "hr")} value={<YesNo value={leaveType.requires_approval} />} />
              <InfoRow label={t("leave.allow_half_day", "hr")} value={<YesNo value={leaveType.allow_half_day} />} />
              <InfoRow label={t("leave.allow_hourly", "hr")} value={<YesNo value={leaveType.allow_hourly} />} />
              <InfoRow label={t("leave.allow_split", "hr")} value={<YesNo value={leaveType.allow_split} />} />
              <InfoRow label={t("common.is_active", "shared")} value={<YesNo value={leaveType.is_active} />} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <InfoRow label={t("leave.balance_mode", "hr")} value={getLeaveLabel(leaveType, "balance_mode")} />
                <InfoRow label={t("leave.accrual_period", "hr")} value={getLeaveLabel(leaveType, "accrual_period")} />
                <InfoRow label={t("leave.allow_carry_forward", "hr")} value={<YesNo value={leaveType.allow_carry_forward} />} />
                {leaveType.allow_carry_forward && (
                  <InfoRow label={t("leave.carry_forward_limit", "hr")} value={leaveType.carry_forward_limit} />
                )}
              </div>
              <div className="space-y-4">
                <InfoRow label={t("leave.proration_basis", "hr")} value={getLeaveLabel(leaveType, "proration_basis")} />
                <InfoRow label={t("leave.proration_calculation", "hr")} value={getLeaveLabel(leaveType, "proration_calculation")} />
                <InfoRow label={t("leave.proration_rounding", "hr")} value={getLeaveLabel(leaveType, "proration_rounding")} />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-text">{t("leave.eligibility_rules", "hr")}</p>
              <RuleGroupComponent value={leaveType.eligibility_rules} onChange={() => {}} fields={eligibilityFields} disabled />
            </div>

            <div className="space-y-4">
              <InfoRow
                label={t("leave.entitlement_type", "hr")}
                value={isBand ? t("leave.entitlement_band", "hr") : t("leave.entitlement_fixed", "hr")}
              />
              {!isBand && leaveType.entitlement_rules && (
                <div className="flex gap-4">
                  <InfoRow
                    label={t("leave.grant_value", "hr")}
                    value={(leaveType.entitlement_rules as FixedGrantCase).grant.value}
                  />
                  <InfoRow label={t("leave.grant_unit", "hr")} value={getLeaveLabel(leaveType, "unit")} />
                </div>
              )}
              {isBand && leaveType.entitlement_rules && (
                <div className="space-y-3">
                  {(leaveType.entitlement_rules as any).bands?.map((band: any, idx: number) => (
                    <div key={idx} className="border border-border/60 rounded-lg p-4 space-y-3">
                      <p className="text-sm font-medium text-text-muted">{t("leave.band", "hr")} {idx + 1}</p>
                      <RuleGroupComponent value={band.rule} onChange={() => {}} fields={eligibilityFields} disabled />
                      <div className="flex gap-4">
                        <InfoRow label={t("leave.grant_value", "hr")} value={band.grant.value} />
                        <InfoRow label={t("leave.grant_unit", "hr")} value={getLeaveLabel(leaveType, "unit")} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : leaveTypesError.findById ? (
          <p className="text-sm text-danger">{leaveTypesError.findById}</p>
        ) : null}
      </SectionCard>

      <SectionCard className="flex-1 " title={t("leave_request.employee_details", "hr")}>
        {employeeLoading ? (
          <p className="text-sm text-text-muted">{t("common.loading", "shared")}</p>
        ) : employeeError ? (
          <div className="space-y-3">
            <p className="text-sm text-danger">{employeeError}</p>
            <Button variant="outline" size="sm" onClick={() => loadEmployee(lr.employee_id)}>
              {t("common.retry", "shared") || "Retry"}
            </Button>
          </div>
        ) : employee ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <User size={18} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-text">
                {employee.first_name} {employee.father_name ? `${employee.father_name} ` : ""}
                {employee.grandfather_name ? `${employee.grandfather_name} ` : ""}
                {employee.last_name}
              </h3>
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                {employee.personal_id_number}
              </span>
              {employee.employment_details?.status && (
                <span className="px-3 py-1 bg-success/10 text-success text-xs font-semibold rounded-full border border-success/20">
                  {employee.employment_details.status}
                </span>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-text-muted mb-4">{t("leave_request.request_details", "hr")}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoRow label={t("employees.national_id", "hr")} value={employee.national_id} />
                <InfoRow label={t("employees.gender", "hr")} value={employee.gender === "male" ? (t("employees.gender_male", "hr") || "Male") : employee.gender === "female" ? (t("employees.gender_female", "hr") || "Female") : employee.gender} />
                <InfoRow
                  label={t("employees.date_birth", "hr")}
                  value={
                    <span className="flex items-center gap-2">
                      <span>{employee.date_birth}</span>
                      {employeeAge !== null && (
                        <span className="px-2 py-0.5 rounded bg-success/10 text-success text-xs font-semibold">
                          {employeeAge} {t("leave_request.years", "hr")}
                        </span>
                      )}
                    </span>
                  }
                />
                <InfoRow
                  label={t("employees.place_birth", "hr")}
                  value={employee.place_birth || "-"}
                />
                <InfoRow
                  label={t("employees.marital_status", "hr")}
                  value={
                    employee.marital_status === "married" ? (t("employees.marital_married", "hr") || "Married")
                      : employee.marital_status === "single" ? (t("employees.marital_single", "hr") || "Single")
                      : employee.marital_status === "divorced" ? (t("employees.marital_divorced", "hr") || "Divorced")
                      : employee.marital_status === "widowed" ? (t("employees.marital_widowed", "hr") || "Widowed")
                      : employee.marital_status || "-"
                  }
                />
                <InfoRow label={t("employees.number_of_children", "hr")} value={employee.number_of_children ?? 0} />
                <InfoRow label={t("employees.blood_type", "hr")} value={employee.blood_type || "-"} />
                <InfoRow label={t("employees.phone_number", "hr")} value={employee.phone_number || "-"} />
                <InfoRow label={t("employees.sham_cash_account", "hr")} value={employee.sham_cash_account || "-"} />
                <InfoRow label={t("employees.civil_registry_record", "hr")} value={employee.civil_registry_record || "-"} />
                <InfoRow label={t("employees.mother_name", "hr")} value={employee.mother_name || "-"} />
                <InfoRow label={t("employees.grandfather_name", "hr")} value={employee.grandfather_name || "-"} />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-text-muted mb-4 flex items-center gap-1.5">
                <Briefcase size={14} className="text-primary" />
                {t("show_employee.employment_details", "hr")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoRow label={t("employees.job_title", "hr")} value={employee.employment_details?.job_title || "-"} />
                <InfoRow
                  label={t("employees.org_unit_id", "hr")}
                  value={employee.employment_details?.organizational_unit?.name || employee.employment_details?.org_unit_id || "-"}
                />
                <InfoRow label={t("employees.job_category", "hr")} value={employee.employment_details?.job_category || "-"} />
                <InfoRow label={t("employees.assigned_job", "hr")} value={employee.assigned_job || "-"} />
                <InfoRow
                  label={t("employees.appointment_date", "hr")}
                  value={
                    <span className="flex items-center gap-2">
                      <span>{employee.employment_details?.appointment_date || "-"}</span>
                      {yearsOfService !== null && (
                        <span className="px-2 py-0.5 rounded bg-success/10 text-success text-xs font-semibold">
                          {yearsOfService} {t("leave_request.years", "hr")}
                        </span>
                      )}
                    </span>
                  }
                />
                <InfoRow label={t("employees.employee_status_id", "hr")} value={employee.employee_status ? (String(getLocalizedName(employee.employee_status.name)) || employee.employee_status_id) : employee.employee_status_id || "-"} />
                <InfoRow label={t("employees.job_status", "hr")} value={employee.job_status ? (String(getLocalizedName(employee.job_status.name)) || employee.job_status_id) : employee.job_status_id || "-"} />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-text-muted mb-4 flex items-center gap-1.5">
                <HeartPulse size={14} className="text-danger" />
                {t("show_employee.health_residence", "hr")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoRow label={t("employees.health_status", "hr")} value={employee.health_status || "-"} />
                <InfoRow label={t("employees.country", "hr")} value={String(employee.country?.name || "-")} />
                <InfoRow label={t("employees.city", "hr")} value={String(employee.city?.name || "-")} />
                <InfoRow label={t("employees.residential_area_details", "hr")} value={employee.residential_area_details || "-"} />
                {employee.injury_details && (
                  <InfoRow
                    label={t("employees.injury_details", "hr")}
                    value={
                      <span>
                        {employee.injury_details}
                        {employee.injury_date && <span className="block text-xs text-text-muted mt-1">{employee.injury_date}</span>}
                      </span>
                    }
                  />
                )}
              </div>
            </div>

            {employee.spouses && employee.spouses.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-text-muted mb-4 flex items-center gap-1.5">
                  <Users size={14} className="text-primary" />
                  {t("employees.spouses", "hr")}
                </p>
                <div className="space-y-2">
                  {employee.spouses.map((s, i) => (
                    <div key={s.id || i} className="rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm">
                      <span className="font-semibold text-text">{s.name || "-"}</span>
                      {s.workplace && <span className="text-text-muted"> — {s.workplace}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {employee.children && employee.children.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-text-muted mb-4 flex items-center gap-1.5">
                  <Users size={14} className="text-primary" />
                  {t("employees.children", "hr")}
                </p>
                <div className="space-y-2">
                  {employee.children.map((c, i) => (
                    <div key={c.id || i} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm">
                      <span className="font-semibold text-text">{c.name || "-"}</span>
                      <span className="text-text-muted">{c.birthdate || ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {employee.educations && employee.educations.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-text-muted mb-4 flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-primary" />
                  {t("show_employee.education_details", "hr")}
                </p>
                <div className="space-y-2">
                  {employee.educations.map((edu, i) => (
                    <div key={edu.id || i} className="rounded-lg border border-border/60 bg-background/40 p-3">
                      <p className="text-sm font-bold text-text">{edu.degree_name || "-"}</p>
                      <p className="text-xs text-text-muted mt-1">
                        {getLocalizedName(edu.university?.name) || edu.university_id || "-"}
                        {edu.faculty?.name ? ` — ${getLocalizedName(edu.faculty.name)}` : ""}
                        {edu.specialization?.name ? ` — ${getLocalizedName(edu.specialization.name)}` : ""}
                        {edu.graduation_year ? ` — ${edu.graduation_year}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-text-muted">{t("common.not_found", "shared")}</p>
        )}
      </SectionCard>
</div>


      <SectionCard title={t("leave_request.eligibility_assessment", "hr")}>
        {employeeLoading ? (
          <p className="text-sm text-text-muted">{t("common.loading", "shared")}</p>
        ) : employeeError ? (
          <p className="text-sm text-danger">{employeeError}</p>
        ) : !leaveType ? (
          <p className="text-sm text-text-muted">{t("common.loading", "shared")}</p>
        ) : !hasEligibilityRules ? (
          <p className="text-sm text-text-muted">{t("leave_request.no_eligibility_rules", "hr")}</p>
        ) : (
          <div className="space-y-4">
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 ${
                isEligible ? "bg-success/10 border-success/20" : "bg-danger/10 border-danger/20"
              }`}
            >
              {isEligible ? <CheckCircle2 size={22} className="text-success" /> : <XCircle size={22} className="text-danger" />}
              <div>
                <p className={`text-lg font-bold ${isEligible ? "text-success" : "text-danger"}`}>
                  {isEligible
                    ? t("leave_request.eligible", "hr")
                    : t("leave_request.not_eligible", "hr")}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {leaveType.name as string}
                </p>
              </div>
              <div className="ms-auto text-xs text-text-muted font-semibold uppercase tracking-wider">
                {leaveType.eligibility_rules.operator === "OR" ? "OR" : "AND"}
              </div>
            </div>

            <div className="space-y-2">
              {leaveType.eligibility_rules.conditions.map((c, i) => (
                <div key={i}>{renderEligibilityNode(c, 0)}</div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
   <SectionCard title={t("leave_request.employee_history", "hr")}>
        {error.findAllEmployeeLeaveRequests ? (
          <ErrorState
            message={error.findAllEmployeeLeaveRequests}
            onRetry={() => lr.employee_id !== undefined && findAllEmployeeLeaveRequests(lr.employee_id)}
          />
        ) : (
          <div className="relative w-full space-y-3">
            <div className="relative flex gap-3 py-1 flex-wrap">
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => { resetFilter(); setSelectedLeaveTypeName("") }}
              >
                {t("common.reset", "shared") || "Reset"}
              </Button>
            </div>
            <DataTable
              columns={historyColumns}
              data={historyRows}
              rowKey="id"
              loading={loading.findAllEmployeeLeaveRequests}
              onRowClick={(row) => window.open(`/hr/employee-leave-requests/${row.id}`, "_blank")}
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
      </SectionCard>
      <Dialog
        isOpen={processAction !== null}
        onClose={() => { setProcessAction(null); setReviewNotes("") }}
        title={processAction === "approve"
          ? (t("leave_request.approve_confirm_title", "hr") || "Approve Leave Request")
          : (t("leave_request.reject_confirm_title", "hr") || "Reject Leave Request")}
        size="md"
        actions={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => { setProcessAction(null); setReviewNotes("") }}>
              {t("common.cancel", "shared") || "Cancel"}
            </Button>
            <Button
              variant={processAction === "approve" ? "primary" : "danger"}
              onClick={handleProcess}
              isLoading={loading.processLeaveRequest}
            >
              {processAction === "approve"
                ? (t("leave_request.approve", "hr") || "Approve")
                : (t("leave_request.reject", "hr") || "Reject")}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            {processAction === "approve"
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

      <CreateEmployeeLeaveRequestDialog
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={() => findLeaveRequestById(Number(id))}
        editData={currentLeaveRequest}
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
