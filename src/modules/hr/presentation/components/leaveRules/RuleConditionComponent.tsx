import type { RuleCondition } from "../../../domain/entities/leave/leave"
import { CustomSelect } from "../../../../../core/presentation/layouts/ui/inputs/CustomSelect"
import { Button } from "../../../../../core/presentation/layouts/ui/buttons/Button"
import Input from "../../../../../core/presentation/layouts/ui/inputs/Input"
import { X } from "lucide-react"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import type { RuleConditionOperators } from "../../../domain/valueObjects/leave/RuleConditionOperators"

export interface RuleField {
  value: string
  label: string
  available_operations: RuleConditionOperators[]
  type: "select" | "number" | "text"
  options?: { value: string; label: string }[]
}

interface RuleConditionComponentProps {
  value: RuleCondition
  onChange: (condition: RuleCondition) => void
  onRemove?: () => void
  fields?: RuleField[]
  disabled?: boolean
  error?: any
}

export const RuleConditionComponent = ({ value, onChange, onRemove, fields = [], disabled = false, error }: RuleConditionComponentProps) => {
  const { t } = useLanguage()

  const ALL_OPERATORS: { value: RuleConditionOperators; label: string }[] = [
    { value: "=", label: t("rules.op_equals", "hr") },
    { value: "!=", label: t("rules.op_not_equals", "hr") },
    { value: ">", label: t("rules.op_greater", "hr") },
    { value: ">=", label: t("rules.op_greater_or_equal", "hr") },
    { value: "<", label: t("rules.op_less", "hr") },
    { value: "<=", label: t("rules.op_less_or_equal", "hr") },
    { value: "in", label: t("rules.op_in", "hr") },
    { value: "between", label: t("rules.op_between", "hr") },
    { value: "contains", label: t("rules.op_contains", "hr") },
  ]
  const currentField = fields.find(f => f.value === value.field)
  const availableOps = currentField?.available_operations
  const operatorOptions = availableOps
    ? ALL_OPERATORS.filter(op => availableOps.includes(op.value))
    : ALL_OPERATORS

  const handleFieldChange = (field: any) => {
    if (disabled) return
    onChange({ ...value, field: String(field) })
  }

  const handleOperatorChange = (operator: any) => {
    if (disabled) return
    onChange({ ...value, operator: operator as RuleConditionOperators })
  }

  const handleValueChange = (val: any) => {
    if (disabled) return
    onChange({ ...value, value: String(val ?? "") })
  }

  const handleRemove = () => {
    if (disabled) return
    onRemove?.()
  }

  const renderValueInput = () => {
    if (currentField?.type === "select" && currentField.options) {
      return (
        <CustomSelect
          options={currentField.options}
          value={value.value}
          disabled={disabled}
          onChange={handleValueChange}
        />
      )
    }
    return (
      <Input
        type={currentField?.type === "number" ? "number" : "text"}
        value={currentField?.type === "number" ? Number(value.value) : value.value ?? ""}
        disabled={disabled}
        onChange={handleValueChange}
        placeholder={value.operator === "in" || value.operator === "between" ? t('rules.value_placeholder_multi', 'hr') : t('rules.value_placeholder', 'hr')}
      />
    )
  }

  return (
    <div className="flex items-center justify-between gap-2 bg-card border border-border/60 rounded-lg p-2.5 flex-wrap">
      <div className="relative w-max flex flex-wrap gap-4">
        <div className="relative w-fit">
          <CustomSelect
            options={fields}
            value={value.field}
            disabled={disabled}
            onChange={handleFieldChange}
          />
        </div>
        <div className="relative w-fit">
          <CustomSelect
            baseClasses="w-fit"
            options={operatorOptions}
            value={value.operator}
            disabled={disabled}
            onChange={handleOperatorChange}
          />
        </div>
        <div className="relative w-fit">
          {renderValueInput()}
          {error?.value?.message && (
            <span className="text-xs text-danger mt-0.5 block">{error.value.message}</span>
          )}
        </div>
      </div>
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={disabled}
          className="shrink-0 text-danger hover:bg-danger/10"
        >
          <X size={16} />
        </Button>
      )}
    </div>
  )
}
