import { useEffect, useState, useRef } from "react"
import { FormProvider, useFieldArray, useWatch, useFormContext } from "react-hook-form"
import { useDynamicForm } from "../../../../../core/presentation/hooks/useDynamicForm221"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { FormInput, type FormInputProps } from "../../../../../core/presentation/layouts/ui/inputs/FormInput"
import { Button } from "../../../../../core/presentation/layouts/ui/buttons/Button"
import { RuleGroupComponent } from "../../components/leaveRules/RuleGroupComponent"
import type { RuleGroup } from "../../../domain/entities/leave/leave"
import type { RuleField } from "../../components/leaveRules/RuleConditionComponent"
import { Plus, Trash2 } from "lucide-react"
import { getCreateLeaveSchema, type LeaveFormValues } from "../../schemas/leaveForm"
import { getEligibilityFields } from "../../utils/RulesFields"

type FieldConfig = Omit<FormInputProps<any>, "name"> & { name: string }

export const LEAVE_EMPTY_DEFAULTS: LeaveFormValues = {
  name: "",
  description: "",
  unit: "day",
  is_paid: true,
  requires_attachment: false,
  requires_approval: false,
  allow_half_day: false,
  allow_hourly: false,
  allow_split: false,
  min_request_units: 1,
  max_request_units: 30,
  balance_mode: "accrual",
  accrual_period: "yearly",
  allow_carry_forward: false,
  carry_forward_limit: undefined,
  eligibility_rules: {type: "group", operator: "AND", conditions: [] },
  entitlement_rules: {
    type: "fixed",
    grant: { value: 0, unit: "day" },
  },
  proration_rules: {
    basis: "hire_date",
    calculation: "monthly_started",
    rounding: "none",
  },
  is_active: true,
}

interface LeaveFormProps {
  defaultValues?: LeaveFormValues
  onSubmit: (data: LeaveFormValues) => Promise<void>
  onCancel?: () => void
  validateOnMount?: boolean
}



export default function LeaveForm({ defaultValues = LEAVE_EMPTY_DEFAULTS, onSubmit, onCancel, validateOnMount }: LeaveFormProps) {
  const { t } = useLanguage()

  const { handleSubmit, isValid, isSubmitting, form, setValue, trigger, errors, getValues } = useDynamicForm<LeaveFormValues>({
    schema: getCreateLeaveSchema(t) as any,
    defaultValues,
    mode: "onChange",
  })

  const prevErrorCount = useRef(0)
  useEffect(() => {
    const keys = Object.keys(errors)
    if (keys.length > 0 && keys.length !== prevErrorCount.current) {
      const el = document.querySelector(`[for="${keys[0]}"]`)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    prevErrorCount.current = keys.length
  }, [errors])

  const hasTriggered = useRef(false)
  useEffect(() => {
    if (validateOnMount && !hasTriggered.current) {
      hasTriggered.current = true
      trigger()
    }
  }, [validateOnMount, trigger])

  const entitlementType = useWatch({ control: form.control, name: "entitlement_rules.type" })
  const allowCarryForward = useWatch({ control: form.control, name: "allow_carry_forward" })
  const [eligibilityRule, setEligibilityRule] = useState<RuleGroup>(defaultValues.eligibility_rules)
  const eligibilityFields = getEligibilityFields(t)

  useEffect(() => {
    setValue("eligibility_rules" as any, eligibilityRule as any, { shouldValidate: true })
  }, [eligibilityRule])

  useEffect(() => {
    if (entitlementType === "bands") {
      const current = form.getValues("entitlement_rules")
      if (!("bands" in current) || !current.bands?.length) {
        setValue("entitlement_rules" as any, {
          type: "bands",
          bands: [],
        } as any)
      }
    }
  }, [entitlementType])

  const GENERAL_FIELDS: FieldConfig[] = [
    { name: "name", label: t("leave.name", "hr"), required: true },
    { name: "description", label: t("leave.description", "hr"), required: true },
    {
      name: "unit",
      type: "select",
      label: t("leave.unit", "hr"),
      options: [
        { value: "day", label: t("leave.unit_day", "hr") },
        { value: "hour", label: t("leave.unit_hour", "hr") },
      ],
      required: true,
    },
  ]

  const REQUEST_FIELDS: FieldConfig[] = [
    { name: "min_request_units", label: t("leave.min_request_units", "hr"), type: "number", required: true },
    { name: "max_request_units", label: t("leave.max_request_units", "hr"), type: "number", required: true },
  ]

  const BALANCE_FIELDS: FieldConfig[] = [
    {
      name: "balance_mode",
      type: "select",
      label: t("leave.balance_mode", "hr"),
      options: [
        { value: "accrual", label: t("leave.balance_accrual", "hr") },
        { value: "fixed_grant", label: t("leave.balance_fixed_grant", "hr") },
        { value: "once_per_life", label: t("leave.balance_once_per_life", "hr") },
        { value: "once_per_service", label: t("leave.balance_once_per_service", "hr") },
        { value: "none", label: t("leave.balance_none", "hr") },
      ],
      required: true,
    },
    {
      name: "accrual_period",
      type: "select",
      label: t("leave.accrual_period", "hr"),
      options: [
        { value: "yearly", label: t("leave.accrual_yearly", "hr") },
        { value: "monthly", label: t("leave.accrual_monthly", "hr") },
        { value: "none", label: t("leave.accrual_none", "hr") },
      ],
      dependsOn: ["balance_mode"],
      compute: (values) => {
        if (values.balance_mode !== "accrual") return { disabled: true }
        return { disabled: false }
      },
    },
  ]

  const BOOLEAN_FIELDS: FieldConfig[] = [
    { name: "is_paid", type: "checkbox", label: t("leave.is_paid", "hr") },
    { name: "requires_attachment", type: "checkbox", label: t("leave.requires_attachment", "hr") },
    { name: "requires_approval", type: "checkbox", label: t("leave.requires_approval", "hr") },
    { name: "allow_half_day", type: "checkbox", label: t("leave.allow_half_day", "hr") },
    { name: "allow_hourly", type: "checkbox", label: t("leave.allow_hourly", "hr") },
    { name: "allow_split", type: "checkbox", label: t("leave.allow_split", "hr") },
    { name: "is_active", type: "checkbox", label: t("leave.is_active", "hr") },
  ]

  const PROPORTION_FIELDS: FieldConfig[] = [
    {
      name: "proration_rules.basis",
      type: "select",
      label: t("leave.proration_basis", "hr"),
      options: [
        { value: "hire_date", label: t("leave.proration_hire_date", "hr") },
        { value: "custom_date", label: t("leave.proration_custom_date", "hr") },
      ],
      required: true,
    },
    {
      name: "proration_rules.calculation",
      type: "select",
      label: t("leave.proration_calculation", "hr"),
      options: [
        { value: "monthly_started", label: t("leave.proration_monthly_started", "hr") },
        { value: "monthly_completed", label: t("leave.proration_monthly_completed", "hr") },
        { value: "daily", label: t("leave.proration_daily", "hr") },
      ],
      required: true,
    },
    {
      name: "proration_rules.rounding",
      type: "select",
      label: t("leave.proration_rounding", "hr"),
      options: [
        { value: "none", label: t("leave.proration_rounding_none", "hr") },
        { value: "floor", label: t("leave.proration_rounding_floor", "hr") },
        { value: "ceil", label: t("leave.proration_rounding_ceil", "hr") },
        { value: "half", label: t("leave.proration_rounding_half", "hr") },
      ],
      required: true,
    },
  ]

  const submitHandler = async (data: LeaveFormValues) => {
    const payload = {
      ...data,
      eligibility_rules: eligibilityRule ,
    }
    await onSubmit(payload)
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-bold text-text mb-4">{t("leave.general", "hr")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GENERAL_FIELDS.map((field) => (
              <FormInput key={field.name} {...field} />
            ))}
            {REQUEST_FIELDS.map((field) => (
              <FormInput key={field.name} {...field} />
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-bold text-text mb-4">{t("leave.toggles", "hr")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BOOLEAN_FIELDS.map((field) => (
              <FormInput key={field.name} {...field} />
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-bold text-text mb-4">{t("leave.balance", "hr")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BALANCE_FIELDS.map((field) => (
              <FormInput key={field.name} {...field} />
            ))}
            <FormInput name="allow_carry_forward" type="checkbox" label={t("leave.allow_carry_forward", "hr")} />
            {allowCarryForward && (
              <FormInput name="carry_forward_limit" type="number" label={t("leave.carry_forward_limit", "hr")} />
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-bold text-text mb-4">{t("leave.eligibility_rules", "hr")}</h3>
          <RuleGroupComponent value={eligibilityRule} onChange={setEligibilityRule} fields={eligibilityFields} errors={(errors as any)?.eligibility_rules} />
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-bold text-text mb-4">{t("leave.entitlement_rules", "hr")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormInput
                name="entitlement_rules.type"
                type="select"
                label={t("leave.entitlement_type", "hr")}
                options={[
                  { value: "fixed", label: t("leave.entitlement_fixed", "hr") },
                  { value: "bands", label: t("leave.entitlement_band", "hr") },
                ]}
              />
            </div>
            {entitlementType === "fixed" && (
              <>
                <FormInput name="entitlement_rules.grant.value" type="number" label={t("leave.grant_value", "hr")} />
                <FormInput
                  name="entitlement_rules.grant.unit"
                  type="select"
                  label={t("leave.grant_unit", "hr")}
                  options={[
                    { value: "day", label: t("leave.unit_day", "hr") },
                    { value: "hour", label: t("leave.unit_hour", "hr") },
                  ]}
                />
              </>
            )}
          </div>
          {entitlementType === "bands" && <BandsSection fields={eligibilityFields} />}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-bold text-text mb-4">{t("leave.proration_rules", "hr")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROPORTION_FIELDS.map((field) => (
              <FormInput key={field.name} {...field} />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <Button variant="secondary" onClick={onCancel} type="button">
              {t("common.cancel", "shared")}
            </Button>
          )}
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            {t("common.save", "shared")}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

function BandsSection({ fields }: { fields: RuleField[] }) {
  const { t } = useLanguage()
  const { control, watch, setValue, formState: { errors } } = useFormContext()
  const { fields: bandFields, append, remove } = useFieldArray({ control, name: "entitlement_rules.bands" })

  return (
    <div className="space-y-3">
      {bandFields.map((band, idx) => {
        const bandRule = watch(`entitlement_rules.bands.${idx}.rule`)
        return (
          <div key={band.id} className="border border-border/60 rounded-lg p-4 space-y-3 relative">
            <button
              type="button"
              onClick={() => remove(idx)}
              className="relative cursor-pointer p-1 rounded text-danger hover:bg-danger/10"
            >
              <Trash2 size={16} />
            </button>
            <p className="text-sm font-medium text-text-muted">{t("leave.band", "hr")} {idx + 1}</p>

            <div>
              <p className="text-xs font-medium text-text-muted mb-2">{t("leave.band_rule", "hr")}</p>
              {bandRule && (
                <RuleGroupComponent
                  value={bandRule}
                  onChange={(rule: any) => setValue(`entitlement_rules.bands.${idx}.rule` as any, rule, { shouldValidate: true })}
                  fields={fields}
                  errors={(errors as any)?.entitlement_rules?.bands?.[idx]?.rule}
                />
              )}
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <FormInput name={`entitlement_rules.bands.${idx}.grant.value` as any} type="number" label={t("leave.grant_value", "hr")} />
              </div>
              <div className="flex-1">
                <FormInput
                  name={`entitlement_rules.bands.${idx}.grant.unit` as any}
                  type="select"
                  label={t("leave.grant_unit", "hr")}
                  options={[
                    { value: "day", label: t("leave.unit_day", "hr") },
                    { value: "hour", label: t("leave.unit_hour", "hr") },
                  ]}
                />
              </div>
            </div>
          </div>
        )
      })}
      <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={() => append({ rule: { type: "group", operator: "AND", conditions: [] }, grant: { value: 0, unit: "day" } })}>
        {t("leave.add_band", "hr")}
      </Button>
    </div>
  )
}
