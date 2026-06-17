import type { RuleField } from "../components/leaveRules/RuleConditionComponent";

export const getEligibilityFields = (t: (key: string, module?: string) => string): RuleField[] => [
  { value: "employee_age", label: t("rules.fields.employee_age", "hr"), available_operations: ["=", "!=", ">", ">=", "<", "<="], type: "number" },
  { value: "employee_gender", label: t("rules.fields.employee_gender", "hr"), available_operations: ["="], type: "select", options: [{ value: "male", label: t("rules.fields.opt_male", "hr") }, { value: "female", label: t("rules.fields.opt_female", "hr") }] },
  { value: "employee_number_of_children", label: t("rules.fields.employee_number_of_children", "hr"), available_operations: ["=", "!=", ">", ">=", "<", "<="], type: "number" },
  { value: "employee_years_of_service", label: t("rules.fields.employee_years_of_service", "hr"), available_operations: ["=", "!=", ">", ">=", "<", "<="], type: "number" },
  { value: "employee_marital_status", label: t("rules.fields.employee_marital_status", "hr"), available_operations: ["="], type: "select", options: [{ value: "single", label: t("rules.fields.opt_single", "hr") }, { value: "married", label: t("rules.fields.opt_married", "hr") }, { value: "divorced", label: t("rules.fields.opt_divorced", "hr") }, { value: "widowed", label: t("rules.fields.opt_widowed", "hr") }] },
  { value: "employee_job_title", label: t("rules.fields.employee_job_title", "hr"), available_operations: ["=", "!=", "contains"], type: "text" },
  { value: "employee_contract_type", label: t("rules.fields.employee_contract_type", "hr"), available_operations: ["="], type: "select", options: [{ value: "permanent", label: t("rules.fields.opt_permanent", "hr") }, { value: "contract", label: t("rules.fields.opt_contract", "hr") }, { value: "part_time", label: t("rules.fields.opt_part_time", "hr") }] },
]