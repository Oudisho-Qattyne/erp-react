import { useEffect, useState, useRef } from "react"
import { FormProvider, useFieldArray, useWatch, useFormContext } from "react-hook-form"
import { useDynamicForm } from "../../../../../core/presentation/hooks/useDynamicForm221"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { useDialogClose } from "../../../../../core/presentation/layouts/ui/dialog/Dialog"
import { useConfirmOnClose } from "../../../../../core/presentation/layouts/ui/dialog/useConfirmOnClose"
import { FormInput } from "../../../../../core/presentation/layouts/ui/inputs/FormInput"
import { Button } from "../../../../../core/presentation/layouts/ui/buttons/Button"
import { RuleGroupComponent } from "../../components/leaveRules/RuleGroupComponent"
import type { RuleGroup } from "../../../domain/entities/leave/leave"
import type { RuleField } from "../../components/leaveRules/RuleConditionComponent"
import { Plus, Trash2 } from "lucide-react"
import { getCreateLeaveSchema, type LeaveFormValues } from "../../schemas/leaveForm"
import { getEligibilityFields } from "../../utils/RulesFields"
import { cleanPayload } from "../../../../../core/utils/cleanPayload"
import { applyServerValidationErrors } from "../../../../../core/presentation/utils/handleApiError"
import {
  buildLeaveGeneralFields,
  buildLeaveRequestFields,
  buildLeaveBalanceFields,
  buildLeaveBooleanFields,
  buildLeaveProportionFields,
} from "../../forms/leaveFormConfig"


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
  eligibility_rules: { type: "group", operator: "AND", conditions: [] },
  entitlement_rules: {
    type: "fixed",
    grant: { value: 0, unit: "day" },
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

  const errorCount = Object.keys(errors).length
  const { requestClose } = useDialogClose()
  useConfirmOnClose(() => form.formState.isDirty)

  const handleCancel = () => {
    if (requestClose) {
      requestClose()
    } else {
      onCancel?.()
    }
  }
  useEffect(() => {
    const keys = Object.keys(errors)
    if (keys.length > 0) {
      const el = document.querySelector(`[for="${keys[0]}"]`)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [errorCount])

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

  const GENERAL_FIELDS = buildLeaveGeneralFields(t)

  const REQUEST_FIELDS = buildLeaveRequestFields(t)

  const BALANCE_FIELDS = buildLeaveBalanceFields(t)

  const BOOLEAN_FIELDS = buildLeaveBooleanFields(t)

  const PROPORTION_FIELDS = buildLeaveProportionFields(t)

  const submitHandler = async (data: LeaveFormValues) => {
    const payload = cleanPayload({
      ...data,
      eligibility_rules: eligibilityRule,
    })
    try {
      
      await onSubmit(payload)
    } catch (err: any) {
      applyServerValidationErrors(err, form.setError)
      throw err
    }
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
            <Button variant="secondary" onClick={handleCancel} type="button">
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
