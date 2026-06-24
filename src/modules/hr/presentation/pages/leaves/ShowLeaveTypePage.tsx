import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { useLeaveTypes } from "../../hooks/leave/useLeaveTypes"
import { useLeaveTypeLocalization } from "../../hooks/leave/useLeaveTypeLocalization"
import { Button } from "../../../../../core/presentation/layouts/ui/buttons/Button"
import { LoadingState } from "../../../../../core/presentation/layouts/ui/state/LoadingState"
import { ErrorState } from "../../../../../core/presentation/layouts/ui/state/ErrorState"
import { RuleGroupComponent } from "../../components/leaveRules/RuleGroupComponent"
import { ArrowRight, CheckCircle, XCircle } from "lucide-react"
import type { Leave, Band, FixedGrantCase } from "../../../domain/entities/leave/leave"
import { getEligibilityFields } from "../../utils/RulesFields"

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-base font-medium text-text">
        {value ?? <span className="text-text-muted/50 italic">—</span>}
      </span>
    </div>
  )
}

function YesNo({ value }: { value: boolean }) {
  return value
    ? <span className="inline-flex items-center gap-1 text-success"><CheckCircle size={16} /> Yes</span>
    : <span className="inline-flex items-center gap-1 text-text-muted"><XCircle size={16} /> No</span>
}

export function ShowLeaveTypePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, direction } = useLanguage()
  const { currentLeave, findById, loading, error } = useLeaveTypes()
  const { getLeaveLabel } = useLeaveTypeLocalization()

  useEffect(() => {
    if (id) findById(Number(id))
  }, [id])

  if (loading.findById) return <LoadingState message={t("common.loading", "shared")} />
  if (error.findById || !currentLeave) {
    return (
      <ErrorState
        message={error.findById || t("show_leave.not_found", "hr")}
        onRetry={() => navigate("/hr/leaves")}
        retryLabel={t("show_leave.back_to_list", "hr")}
      />
    )
  }

  const leave = currentLeave
  const isBand = leave.entitlement_rules?.type === "bands"
  const eligibilityFields = getEligibilityFields(t)

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      employee_age: t("rules.fields.employee_age", "hr"),
      employee_gender: t("rules.fields.employee_gender", "hr"),
      employee_number_of_children: t("rules.fields.employee_number_of_children", "hr"),
      employee_years_of_service: t("rules.fields.employee_years_of_service", "hr"),
      employee_marital_status: t("rules.fields.employee_marital_status", "hr"),
      employee_job_title: t("rules.fields.employee_job_title", "hr"),
      employee_contract_type: t("rules.fields.employee_contract_type", "hr"),
    }
    return labels[field] || field
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 p-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate("/hr/leaves")}
          leftIcon={<ArrowRight size={18} className={direction === "rtl" ? "rotate-180" : ""} />}
          className="text-text-muted hover:text-text"
        >
          {t("leave.show_leave.back", "hr")}
        </Button>
        {/* <Button variant="primary" onClick={() => navigate(`/hr/leaves/${id}/edit`)}>
          {t("leave.show_leave.edit", "hr")}
        </Button> */}
      </div>

      <div className="bg-card/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-border shadow-sm">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary via-primary-light to-primary opacity-70" />
        <h1 className="text-2xl md:text-3xl font-bold text-text">{leave.name as string}</h1>
        <p className="text-text-muted mt-2">{leave.description}</p>
        <div className="flex flex-wrap gap-4 mt-4">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
            {leave.unit === "day" ? t("leave.unit_day", "hr") : t("leave.unit_hour", "hr")}
          </span>
          {leave.archived_at && (
            <span className="px-3 py-1 bg-warning/10 text-warning text-xs font-semibold rounded-full border border-warning/20">
              {t("leave.show_leave.archived", "hr")}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
          <h2 className="text-lg font-bold text-text mb-4 pb-3 border-b border-border/50">
            {t("leave.general", "hr")}
          </h2>
          <div className="space-y-4">
            <InfoRow label={t("leave.name", "hr")} value={leave.name as string} />
            <InfoRow label={t("leave.description", "hr")} value={leave.description} />
            <InfoRow label={t("leave.unit", "hr")} value={getLeaveLabel(leave, "unit")} />
            <InfoRow label={t("leave.min_request_units", "hr")} value={leave.min_request_units} />
            <InfoRow label={t("leave.max_request_units", "hr")} value={leave.max_request_units} />
          </div>
        </div>

        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
          <h2 className="text-lg font-bold text-text mb-4 pb-3 border-b border-border/50">
            {t("leave.toggles", "hr")}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label={t("leave.is_paid", "hr")} value={<YesNo value={leave.is_paid} />} />
            <InfoRow label={t("leave.requires_attachment", "hr")} value={<YesNo value={leave.requires_attachment} />} />
            <InfoRow label={t("leave.requires_approval", "hr")} value={<YesNo value={leave.requires_approval} />} />
            <InfoRow label={t("leave.allow_half_day", "hr")} value={<YesNo value={leave.allow_half_day} />} />
            <InfoRow label={t("leave.allow_hourly", "hr")} value={<YesNo value={leave.allow_hourly} />} />
            <InfoRow label={t("leave.allow_split", "hr")} value={<YesNo value={leave.allow_split} />} />
            <InfoRow label={t("leave.is_active", "hr")} value={<YesNo value={leave.is_active} />} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
          <h2 className="text-lg font-bold text-text mb-4 pb-3 border-b border-border/50">
            {t("leave.balance", "hr")}
          </h2>
          <div className="space-y-4">
            <InfoRow label={t("leave.balance_mode", "hr")} value={getLeaveLabel(leave, "balance_mode")} />
            <InfoRow label={t("leave.accrual_period", "hr")} value={getLeaveLabel(leave, "accrual_period")} />
            <InfoRow label={t("leave.allow_carry_forward", "hr")} value={<YesNo value={leave.allow_carry_forward} />} />
            {leave.allow_carry_forward && (
              <InfoRow label={t("leave.carry_forward_limit", "hr")} value={leave.carry_forward_limit} />
            )}
          </div>
        </div>

        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
          <h2 className="text-lg font-bold text-text mb-4 pb-3 border-b border-border/50">
            {t("leave.proration_rules", "hr")}
          </h2>
          <div className="space-y-4">
            <InfoRow label={t("leave.proration_basis", "hr")} value={getLeaveLabel(leave, "proration_basis")} />
            <InfoRow label={t("leave.proration_calculation", "hr")} value={getLeaveLabel(leave, "proration_calculation")} />
            <InfoRow label={t("leave.proration_rounding", "hr")} value={getLeaveLabel(leave, "proration_rounding")} />
          </div>
        </div>
      </div>

      <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
        <h2 className="text-lg font-bold text-text mb-4 pb-3 border-b border-border/50">
          {t("leave.eligibility_rules", "hr")}
        </h2>
        <RuleGroupComponent value={leave.eligibility_rules} onChange={() => {}} fields={eligibilityFields} disabled />
      </div>

      <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
        <h2 className="text-lg font-bold text-text mb-4 pb-3 border-b border-border/50">
          {t("leave.entitlement_rules", "hr")}
        </h2>
        <div className="space-y-4">
          <InfoRow
            label={t("leave.entitlement_type", "hr")}
            value={isBand ? t("leave.entitlement_band", "hr") : t("leave.entitlement_fixed", "hr")}
          />
          {!isBand && leave.entitlement_rules && (
            <div className="flex gap-4">
              <InfoRow
                label={t("leave.grant_value", "hr")}
                value={(leave.entitlement_rules as FixedGrantCase).grant.value}
              />
              <InfoRow
                label={t("leave.grant_unit", "hr")}
                value={getLeaveLabel(leave, "unit")}
              />
            </div>
          )}
          {isBand && leave.entitlement_rules && (
            <div className="space-y-3">
              {(leave.entitlement_rules as any).bands?.map((band: any, idx: number) => (
                <div key={idx} className="border border-border/60 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-text-muted">{t("leave.band", "hr")} {idx + 1}</p>
                  <RuleGroupComponent value={band.rule} onChange={() => {}} fields={eligibilityFields} disabled />
                  <div className="flex gap-4">
                    <InfoRow label={t("leave.grant_value", "hr")} value={band.grant.value} />
                    <InfoRow label={t("leave.grant_unit", "hr")} value={getLeaveLabel(leave, "unit")} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
