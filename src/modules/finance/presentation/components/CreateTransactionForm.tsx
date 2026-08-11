import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { GenericCreateForm } from "../../../../core/presentation/layouts/ui/forms/GenericCreateForm"
import { getCreateTransactionFormSchema } from "../schemas/transactionForm.schema"
import { useTransactions } from "../hooks/useTransactions"
import { buildTransactionFormFields } from "../forms/transactionFormConfig"

interface CreateTransactionFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function CreateTransactionForm({ onSuccess, onCancel }: CreateTransactionFormProps) {
  const { t } = useLanguage()
  const { createTransaction } = useTransactions()

  const fields = buildTransactionFormFields(t)

  return (
    <GenericCreateForm
      schema={getCreateTransactionFormSchema(t)}
      fields={fields}
      onSubmit={(data) => createTransaction({ ...data, transaction_status: "pending" })}
      onSuccess={() => onSuccess()}
      onCancel={onCancel}
      submitLabel={t("common.save", "shared") || "Save"}
    />
  )
}
