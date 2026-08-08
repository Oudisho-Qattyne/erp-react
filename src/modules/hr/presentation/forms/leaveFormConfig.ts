import type { FieldConfig } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';

type Translate = (key: string, module?: string) => string;

export const buildLeaveGeneralFields = (t: Translate): FieldConfig[] => [
  { name: "name", type: "alpha", label: t("leave.name", "hr"), required: true },
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

export const buildLeaveRequestFields = (t: Translate): FieldConfig[] => [
  { name: "min_request_units", label: t("leave.min_request_units", "hr"), type: "number", required: true },
  { name: "max_request_units", label: t("leave.max_request_units", "hr"), type: "number", required: true },
]

export const buildLeaveBalanceFields = (t: Translate): FieldConfig[] => [
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
      // { value: "none", label: t("leave.accrual_none", "hr") },
    ],
    dependsOn: ["balance_mode"],
    compute: (values) => {
      if (values.balance_mode !== "accrual") return { disabled: true , value : null }
      return { disabled: false }
    },
  },
  {
    name:'allow_carry_forward',
    label:t("leave.allow_carry_forward", "hr"),
    type:'checkbox',
    dependsOn: ["balance_mode"],
    compute: (values) => {
      if (values.balance_mode !== "accrual") return { disabled: true ,value:false}
      return { disabled: false }
    },
  },
  {
    name:'carry_forward_limit',label:t("leave.carry_forward_limit", "hr"), type:'number',
    dependsOn: ["allow_carry_forward" , "balance_mode"],
    compute: (values) => {
      if (values.allow_carry_forward == false) return { disabled: true , value:null}
      if (values.balance_mode !== "accrual") return { disabled: true ,value:null}
      return { disabled: false }
      
    },
  }
  
]

export const buildLeaveBooleanFields = (t: Translate): FieldConfig[] => [
  { name: "is_paid", type: "checkbox", label: t("leave.is_paid", "hr") },
  { name: "requires_attachment", type: "checkbox", label: t("leave.requires_attachment", "hr") },
  { name: "requires_approval", type: "checkbox", label: t("leave.requires_approval", "hr") },
  { name: "allow_half_day", type: "checkbox", label: t("leave.allow_half_day", "hr") },
  { name: "allow_hourly", type: "checkbox", label: t("leave.allow_hourly", "hr") },
  { name: "allow_split", type: "checkbox", label: t("leave.allow_split", "hr") },
  { name: "is_active", type: "checkbox", label: t("common.is_active", "shared") },
]

export const buildLeaveProportionFields = (t: Translate): FieldConfig[] => [
  {
    name: "proration_rules.basis",
    type: "select",
    label: t("leave.proration_basis", "hr"),
    options: [
      { value: "hire_date", label: t("leave.proration_hire_date", "hr") },
      // { value: "custom_date", label: t("leave.proration_custom_date", "hr") },
    ],
    dependsOn: ["balance_mode"],
    compute: (values) => {
      if (values.balance_mode !== "accrual") return { disabled: true ,value:null}
      return { disabled: false }
    },
  },
  {
    name: "proration_rules.calculation",
    type: "select",
    label: t("leave.proration_calculation", "hr"),
    options: [
      { value: "monthly_started", label: t("leave.proration_monthly_started", "hr") },
      { value: "monthly_completed", label: t("leave.proration_monthly_completed", "hr") },
      // { value: "daily", label: t("leave.proration_daily", "hr") },
    ],
    dependsOn: ["balance_mode"],
    compute: (values) => {
      if (values.balance_mode !== "accrual") return { disabled: true ,value:null}
      return { disabled: false }
    },
  },
  {
    name: "proration_rules.rounding",
    type: "select",
    label: t("leave.proration_rounding", "hr"),
    options: [
      { value: "none", label: t("leave.proration_rounding_none", "hr") },
      { value: "floor", label: t("leave.proration_rounding_floor", "hr") },
      { value: "ceil", label: t("leave.proration_rounding_ceil", "hr") },
      // { value: "half", label: t("leave.proration_rounding_half", "hr") },
    ],
    dependsOn: ["balance_mode"],
    compute: (values) => {
      if (values.balance_mode !== "accrual") return { disabled: true ,value:null}
      return { disabled: false }
    },
  },
]
