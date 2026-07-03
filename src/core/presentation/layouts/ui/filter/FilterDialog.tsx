import { useEffect } from "react"
import { useForm, FormProvider, type UseFormReturn } from "react-hook-form"
import { Dialog } from "../dialog/Dialog"
import { Button } from "../buttons/Button"
import { FormInput, type FormInputProps } from "../inputs/FormInput"
import { useLanguage } from "../../../context/i18n/I18nProvider"

type BuiltInField = Omit<FormInputProps<any>, "name"> & { name: string }
type CustomField = { name: string; render: (form: UseFormReturn) => React.ReactNode }
export type FilterField = BuiltInField | CustomField

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
  const form = useForm({ defaultValues: initialValues })

  useEffect(() => {
    form.reset(initialValues)
  }, [initialValues, isOpen])

  const handleApply = () => onFilter(form.getValues())
  const handleReset = () => {
    const empty = Object.fromEntries(fields.map((f) => [f.name, ""]))
    form.reset(empty)
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
      <FormProvider {...form}>
        <div className="space-y-4">
          {fields.map((field) => {
            if ("render" in field) {
              return <div key={field.name}>{field.render(form)}</div>
            }
            return <FormInput key={field.name} {...field} name={field.name as any} />
          })}
        </div>
      </FormProvider>
    </Dialog>
  )
}
