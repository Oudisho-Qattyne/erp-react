import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { useLeaveTypes } from "../../hooks/leave/useLeaveTypes"
import { Button } from "../../../../../core/presentation/layouts/ui/buttons/Button"
import { LoadingState } from "../../../../../core/presentation/layouts/ui/state/LoadingState"
import { ErrorState } from "../../../../../core/presentation/layouts/ui/state/ErrorState"
import LeaveForm from "./LeaveForm"
import { ArrowRight } from "lucide-react"
import type { LeaveFormValues } from "../../schemas/leaveForm"
import type { Leave } from "../../../domain/entities/leave/leave"
import type { UpdateLeaveTypeDto } from "../../../application/dtos/leave/LeaveTypeDto"
import { isValid } from "zod/v3"

export function EditLeaveTypePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, direction } = useLanguage()
  const { currentLeave, findById, update, loading } = useLeaveTypes()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [defaultValues, setDefaultValues] = useState<LeaveFormValues | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!id) return
      await findById(Number(id))
    }
    load()
  }, [id])

  useEffect(() => {
    if (currentLeave) {
      setDefaultValues(mapLeaveToForm(currentLeave))
    }
  }, [currentLeave])

  const handleSubmit = async (data: LeaveFormValues) => {
    try {
      setSaving(true)
      setError(null)
      const payload: UpdateLeaveTypeDto = data as any
      await update(Number(id), payload)
      navigate(`/hr/leaves/${id}`)
    } catch (err: any) {
      setError(err.message || t("edit_leave.update_error", "hr"))
    } finally {
      setSaving(false)
    }
  }

  if (loading.findById && !defaultValues) return <LoadingState message={t('common.loading', 'shared') || 'Loading...'} />
  if (error && !defaultValues) {
    return (
      <ErrorState
        message={error}
        onRetry={() => navigate("/hr/leaves")}
        retryLabel={t("edit_leave.back_to_list", "hr")}
      />
    )
  }
  

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/hr/leaves/${id}`)}
            leftIcon={<ArrowRight size={18} className={direction === "rtl" ? "rotate-180" : ""} />}
            className="text-text-muted hover:text-text"
          >
            {t("leave.edit_leave.back", "hr")}
          </Button>
          <h1 className="text-2xl font-bold text-text">{t("leave.edit_leave.title", "hr")}</h1>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger p-4 rounded-lg border border-danger/20">{error}</div>
      )}

      {defaultValues && (
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
          <LeaveForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/hr/leaves/${id}`)}
            validateOnMount
          />
        </div>
      )}
    </div>
  )
}

function sanitizeRuleGroup(node: any): any {
  if (!node) return node
  if (node.type === "condition") {
    return {
      ...node,
      value: node.value ?? "",
      field: node.field ?? "",
      operator: node.operator ?? "=",
    }
  }
  if (node.type === "group") {
    return {
      ...node,
      operator: node.operator || "AND",
      conditions: (node.conditions || []).map(sanitizeRuleGroup),
    }
  }
  return node
}

function mapLeaveToForm(leave: Leave): LeaveFormValues {
  return {
    name: leave.name as string,
    description: leave.description,
    unit: leave.unit,
    is_paid: leave.is_paid,
    requires_attachment: leave.requires_attachment,
    requires_approval: leave.requires_approval,
    allow_half_day: leave.allow_half_day,
    allow_hourly: leave.allow_hourly,
    allow_split: leave.allow_split,
    min_request_units:Number(leave.min_request_units),
    max_request_units: Number(leave.max_request_units),
    balance_mode: leave.balance_mode,
    accrual_period: leave.accrual_period,
    allow_carry_forward: leave.allow_carry_forward,
    carry_forward_limit: Number(leave.carry_forward_limit),
    eligibility_rules: sanitizeRuleGroup(leave.eligibility_rules),
    entitlement_rules: leave.entitlement_rules || { type: "fixed", grant: { value: 0, unit: "day" } },
    proration_rules: leave.proration_rules,
    is_active: leave.is_active,
  }
}
