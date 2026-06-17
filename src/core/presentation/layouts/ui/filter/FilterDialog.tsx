import { useState, useEffect } from "react"
import { Dialog } from "../dialog/Dialog"
import { Button } from "../buttons/Button"
import Input from "../inputs/Input"
import { useLanguage } from "../../../context/i18n/I18nProvider"

export interface FilterField {
  name: string
  label: string
  type: "text" | "select" | "number" | "date" | "boolean"
  options?: { value: string; label: string }[]
}

interface FilterDialogProps {
  isOpen: boolean
  fields: FilterField[]
  initialValues?: Record<string, any>
  onFilter: (values: Record<string, any>) => void
  onCancel: () => void
  onReset?: () => void
}

export function FilterDialog({ isOpen, fields, initialValues = {}, onFilter, onCancel, onReset }: FilterDialogProps) {
  const { t } = useLanguage()
  const [values, setValues] = useState<Record<string, any>>(initialValues)

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues, isOpen])

  const setValue = (name: string, val: any) => {
    setValues((prev) => ({ ...prev, [name]: val }))
  }

  const handleApply = () => onFilter(values)
  const handleReset = () => {
    const empty = Object.fromEntries(fields.map((f) => [f.name, ""]))
    setValues(empty)
    onReset?.()
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onCancel}
      title={t("common.filter", "shared") || "تصفية"}
      size="md"
      actions={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" onClick={onCancel}>
            {t("common.cancel", "shared") || "إلغاء"}
          </Button>
          <Button variant="outline" onClick={handleReset}>
            {t("common.reset", "shared") || "مسح"}
          </Button>
          <Button variant="primary" onClick={handleApply}>
            {t("common.apply", "shared") || "تطبيق"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-text mb-1">{field.label}</label>
            {field.type === "boolean" ? (
              <select
                value={values[field.name] ?? ""}
                onChange={(e) => setValue(field.name, e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">{t("common.all", "shared") || "الكل"}</option>
                <option value="true">{t("common.yes", "shared") || "نعم"}</option>
                <option value="false">{t("common.no", "shared") || "لا"}</option>
              </select>
            ) : field.type === "select" ? (
              <select
                value={values[field.name] ?? ""}
                onChange={(e) => setValue(field.name, e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">{t("common.all", "shared") || "الكل"}</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                type={field.type === "number" ? "number" : "text"}
                value={values[field.name] ?? ""}
                onChange={(val) => setValue(field.name, val)}
                placeholder={field.label}
              />
            )}
          </div>
        ))}
      </div>
    </Dialog>
  )
}
