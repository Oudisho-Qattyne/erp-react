import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { GenericCreateForm } from "../../../../core/presentation/layouts/ui/forms/GenericCreateForm"
import { getCreateCurrencyFormSchema } from "../schemas/currencyForm.schema"
import { useCurrencies } from "../hooks/useCurrencies"
import { buildCreateCurrencyFormFields } from "../forms/currencyFormConfig"

interface CreateCurrencyFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function CreateCurrencyForm({ onSuccess, onCancel }: CreateCurrencyFormProps) {
  const { t } = useLanguage()
  const { createCurrency } = useCurrencies()

  const fields = buildCreateCurrencyFormFields(t)

  return (
    <GenericCreateForm
      schema={getCreateCurrencyFormSchema(t)}
      fields={fields}
      defaultValues={{ is_active: true }}
      onSubmit={(data) => createCurrency(data)}
      onSuccess={() => onSuccess()}
      onCancel={onCancel}
      submitLabel={t("common.save", "shared") || "Save"}
    />
  )
}
