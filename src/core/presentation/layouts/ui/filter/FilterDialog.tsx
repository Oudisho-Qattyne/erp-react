import { useEffect, useState } from "react"
import { useForm, FormProvider, type UseFormReturn } from "react-hook-form"
import { Dialog } from "../dialog/Dialog"
import { Button } from "../buttons/Button"
import { FormInput, type FormInputProps } from "../inputs/FormInput"
import { useLanguage } from "../../../context/i18n/I18nProvider"

type BuiltInField = Omit<FormInputProps<any>, "name"> & { name: string }
type CustomField = { name: string; render: (form: UseFormReturn) => React.ReactNode }
export type FilterField = BuiltInField | CustomField

/** fieldName → (raw value → label). Captured at apply time so ActiveFilters can
 *  show labels for table-pickers and computed selects without refetching. */
export type FilterLabelMaps = Record<string, Record<string, string>>

interface FilterDialogProps {
  isOpen: boolean
  fields: FilterField[]
  initialValues?: Record<string, any>
  onFilter: (values: Record<string, any>, labelMaps?: FilterLabelMaps) => void
  onCancel: () => void
  onReset?: () => void
}

export function FilterDialog({ isOpen, fields, initialValues = {}, onFilter, onCancel, onReset }: FilterDialogProps) {
  const { t } = useLanguage()
  const form = useForm({ defaultValues: initialValues })
  const [pickedOptions, setPickedOptions] = useState<Record<string, { value: any; label: string }[]>>({})
  const [computedOptions, setComputedOptions] = useState<Record<string, { value: any; label: string }[]>>({})

  useEffect(() => {
    form.reset(initialValues)
  }, [initialValues, isOpen])

  const handleSelectionChange = (name: string) => (items: any[]) => {
    const f = fields.find((x) => x.name === name) as BuiltInField | undefined
    const vk = f?.valueKey ?? "id"
    const lk = f?.labelKey ?? "name"
    setPickedOptions((prev) => ({
      ...prev,
      [name]: items.map((i) => ({ value: i?.[vk], label: String(i?.[lk] ?? "") })),
    }))
  }

  const handleResolvedOptions = (name: string) => (options: { value: any; label: string }[]) => {
    setComputedOptions((prev) => ({ ...prev, [name]: options }))
  }

  const createLabelMaps = (): FilterLabelMaps => {
    const maps: FilterLabelMaps = {}
    for (const f of fields) {
      if ("render" in f) continue
      const pairs: { value: any; label: string }[] = []
      if (f.options?.length) pairs.push(...(f.options as any))
      const picked = pickedOptions[f.name]
      if (picked?.length) pairs.push(...picked)
      const computed = computedOptions[f.name]
      if (computed?.length) pairs.push(...computed)
      if (!pairs.length) continue
      maps[f.name] = {}
      for (const p of pairs) {
        if (p.value === undefined || p.value === null || p.value === "") continue
        maps[f.name][String(p.value)] = p.label
      }
    }
    return maps
  }

  const handleApply = () => onFilter(form.getValues(), createLabelMaps())
  const handleReset = () => {
    const empty = Object.fromEntries(fields.map((f) => [f.name, ""]))
    form.reset(empty)
    setPickedOptions({})
    setComputedOptions({})
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
            return (
              <FormInput
                key={field.name}
                {...field}
                name={field.name as any}
                onSelectionChange={handleSelectionChange(field.name)}
                onResolvedOptions={handleResolvedOptions(field.name)}
              />
            )
          })}
        </div>
      </FormProvider>
    </Dialog>
  )
}