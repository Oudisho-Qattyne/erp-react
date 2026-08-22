import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { GenericCreateForm } from "../../../../core/presentation/layouts/ui/forms/GenericCreateForm"
import { getUpdateCurrencyFormSchema } from "../schemas/currencyForm.schema"
import { useCurrencies } from "../hooks/useCurrencies"
import type { Currency } from "../../domain/entities/Currency"
import { buildCurrencyDefaultValues, buildUpdateCurrencyFormFields } from "../forms/currencyFormConfig"

interface UpdateCurrencyFormProps {
  currency: Currency
  onSuccess: () => void
  onCancel: () => void
}

export function UpdateCurrencyForm({ currency, onSuccess, onCancel }: UpdateCurrencyFormProps) {
  const { t } = useLanguage()
  const { updateCurrency } = useCurrencies()

  const fields = buildUpdateCurrencyFormFields(t)

  return (
    <GenericCreateForm
      schema={getUpdateCurrencyFormSchema(t)}
      fields={fields}
      defaultValues={buildCurrencyDefaultValues(currency)}
      onSubmit={(data) => updateCurrency(currency.code, data)}
      onSuccess={() => onSuccess()}
      onCancel={onCancel}
      submitLabel={t("common.save", "shared") || "Save"}
    />
  )
}
