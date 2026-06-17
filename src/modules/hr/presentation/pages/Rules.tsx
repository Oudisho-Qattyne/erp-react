import { useState } from "react"
import { RuleGroupComponent } from "../components/leaveRules/RuleGroupComponent"
import type { RuleGroup } from "../../domain/entities/leave/leave"
import type { RuleField } from "../components/leaveRules/RuleConditionComponent"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"

const getFields = (t: (key: string, mod?: string) => string): RuleField[] => [
  {
    value: "employee_age",
    label: t("rules.fields.employee_age", "hr"),
    available_operations: ["=", "!=", ">", ">=", "<", "<="],
    type: "number"
  },
  {
    value: "employee_gender",
    label: t("rules.fields.employee_gender", "hr"),
    available_operations: ["="],
    type: "select",
    options: [
      { value: "male", label: t("rules.fields.opt_male", "hr") },
      { value: "female", label: t("rules.fields.opt_female", "hr") }
    ]
  },
  {
    value: "employee_number_of_children",
    label: t("rules.fields.employee_number_of_children", "hr"),
    available_operations: ["=", "!=", ">", ">=", "<", "<="],
    type: "number"
  },
  {
    value: "employee_years_of_service",
    label: t("rules.fields.employee_years_of_service", "hr"),
    available_operations: ["=", "!=", ">", ">=", "<", "<="],
    type: "number"
  },
  {
    value: "employee_marital_status",
    label: t("rules.fields.employee_marital_status", "hr"),
    available_operations: ["="],
    type: "select",
    options: [
      { value: "single", label: t("rules.fields.opt_single", "hr") },
      { value: "married", label: t("rules.fields.opt_married", "hr") },
      { value: "divorced", label: t("rules.fields.opt_divorced", "hr") },
      { value: "widowed", label: t("rules.fields.opt_widowed", "hr") }
    ]
  },
  {
    value: "employee_job_title",
    label: t("rules.fields.employee_job_title", "hr"),
    available_operations: ["=", "!=", "contains"],
    type: "text"
  },
  {
    value: "employee_contract_type",
    label: t("rules.fields.employee_contract_type", "hr"),
    available_operations: ["="],
    type: "select",
    options: [
      { value: "permanent", label: t("rules.fields.opt_permanent", "hr") },
      { value: "contract", label: t("rules.fields.opt_contract", "hr") },
      { value: "part_time", label: t("rules.fields.opt_part_time", "hr") }
    ]
  }
]

const initialRule: RuleGroup = {
  type: "group",
  operator: "AND",
  conditions: [
    {
      type: "condition",
      field: "employee_contract_type",
      operator: "=",
      value: "permanent",
    },
    {
      type: "group",
      operator: "OR",
      conditions: [
        {
          type: "condition",
          field: "employee_years_of_service",
          operator: ">=",
          value: "5",
        },
        {
          type: "condition",
          field: "employee_job_title",
          operator: "=",
          value: "manager",
        },
      ],
    },
  ],
}

export const Rules = () => {
  const [rule, setRule] = useState<RuleGroup>(initialRule)
  const { t } = useLanguage()
  const fields = getFields(t)

  return (
    <div className=" mx-auto p-6">
      <h2 className="text-lg font-bold text-text mb-1">Dynamic Rule Group Builder</h2>
      <p className="text-sm text-text-muted mb-4">Build eligibility rules with nested AND/OR groups and conditions.</p>

      <RuleGroupComponent value={rule} onChange={setRule} fields={fields} />

      <details className="mt-6">
        <summary className="text-sm font-medium text-text-muted cursor-pointer hover:text-text">
          Show JSON
        </summary>
        <pre className="mt-2 p-4 bg-[#1e293b] text-[#e2e8f0] rounded-lg text-sm overflow-x-auto">
          {JSON.stringify(rule, null, 2)}
        </pre>
      </details>
    </div>
  )
}
