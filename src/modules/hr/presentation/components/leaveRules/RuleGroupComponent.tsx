import { useCallback } from "react"
import type { RuleCondition, RuleGroup } from "../../../domain/entities/leave/leave"
import { CustomSelect } from "../../../../../core/presentation/layouts/ui/inputs/CustomSelect"
import { Button } from "../../../../../core/presentation/layouts/ui/buttons/Button"
import { RuleConditionComponent, type RuleField } from "./RuleConditionComponent"
import { Plus, X } from "lucide-react"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import type { RuleGroupOperators } from "../../../domain/valueObjects/leave/RuleGroupOperators"

interface RuleGroupComponentProps {
    value: RuleGroup
    onChange: (group: RuleGroup) => void
    onRemove?: () => void
    fields?: RuleField[]
    disabled?: boolean
    errors?: any
}

export const RuleGroupComponent = ({ value, onChange, onRemove, fields = [], disabled = false, errors }: RuleGroupComponentProps) => {
    const { direction, t } = useLanguage()
    const borderSide = direction === 'rtl' ? 'border-r-3' : 'border-l-3'
    const indentSide = direction === 'rtl' ? 'mr-4' : 'ml-4'
    const addCondition = useCallback(() => {
        if (disabled) return
        const newCondition: RuleCondition = {
            type: "condition",
            field: fields[0]?.value || "department",
            operator: "=",
            value: "",
        }
        onChange({ ...value, conditions: [...value.conditions, newCondition] })
    }, [value, onChange, fields, disabled])

    const addGroup = useCallback(() => {
        if (disabled) return
        const newGroup: RuleGroup = {
            type: "group",
            operator: "AND",
            conditions: [],
        }
        onChange({ ...value, conditions: [...value.conditions, newGroup] })
    }, [value, onChange, disabled])

    const updateCondition = useCallback(
        (index: number, updated: RuleCondition) => {
            if (disabled) return
            const conditions = [...value.conditions]
            conditions[index] = updated
            onChange({ ...value, conditions })
        },
        [value, onChange, disabled]
    )

    const removeItem = useCallback(
        (index: number) => {
            if (disabled) return
            const conditions = value.conditions.filter((_, i) => i !== index)
            onChange({ ...value, conditions })
        },
        [value, onChange, disabled]
    )

    const updateGroup = useCallback(
        (index: number, updated: RuleGroup) => {
            if (disabled) return
            const conditions = [...value.conditions]
            conditions[index] = updated
            onChange({ ...value, conditions })
        },
        [value, onChange, disabled]
    )

    return (
        <div className={`${borderSide} border-primary/40 bg-card rounded-lg p-4 space-y-3`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-muted">{t('rules.operator', 'hr')}</span>
                    <CustomSelect
                        options={[
                            { value: "AND", label: t("rules.group_and", "hr") },
                            { value: "OR", label: t("rules.group_or", "hr") },
                        ]}
                        value={value.operator}
                        disabled={disabled}
                        onChange={(op) => { if (!disabled) onChange({ ...value, operator: op as RuleGroupOperators }) }}
                    />
                    {errors?.operator?.message && (
                        <span className="text-xs text-danger">{errors.operator.message}</span>
                    )}
                </div>
                {onRemove && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRemove}
                        disabled={disabled}
                        className="shrink-0 text-danger hover:bg-danger/10"
                    >
                        <X size={16} />
                    </Button>
                )}
            </div>

            <div className={`space-y-2 ${indentSide}`}>
                {value.conditions.map((item, index) => {
                    return (
                        <div className="relative ">
                            {item.type === "condition" ? (
                                <RuleConditionComponent
                                    key={index}
                                    value={item}
                                    onChange={(updated) => updateCondition(index, updated)}
                                    onRemove={() => removeItem(index)}
                                    fields={fields}
                                    disabled={disabled}
                                    error={errors?.conditions?.[index]}
                                />
                            ) : (
                                <div key={index} className={`${borderSide} border-amber/40 bg-background/50 rounded-lg p-3 relative`}>
                                    <RuleGroupComponent
                                        value={item}
                                        onChange={(updated) => updateGroup(index, updated)}
                                        onRemove={() => removeItem(index)}
                                        fields={fields}
                                        disabled={disabled}
                                        errors={errors?.conditions?.[index]}
                                    />
                                </div>
                            )}
                            {(index < value.conditions.length - 1) &&
                                <p>{value.operator == "AND" ? t("rules.group_and", "hr") : t("rules.group_or", "hr")}</p>
                            }
                        </div>
                    )
                }
                )}

            </div>

            {!disabled && (
                <div className="flex items-center gap-2 pt-1">
                    <Button variant="ghost" size="sm" leftIcon={<Plus size={14} />} onClick={addCondition}>
                        {t('rules.add_condition', 'hr')}
                    </Button>
                    <Button variant="ghost" size="sm" leftIcon={<Plus size={14} />} onClick={addGroup}>
                        {t('rules.add_group', 'hr')}
                    </Button>
                </div>
            )}
        </div>
    )
}
