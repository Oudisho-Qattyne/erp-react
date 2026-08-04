import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { GenericCreateForm, type FieldConfig } from "../../../../core/presentation/layouts/ui/forms/GenericCreateForm"
import { getCreateTransactionFormSchema } from "../schemas/transactionForm.schema"
import { useTransactions } from "../hooks/useTransactions"

const MODULE = "finance"

const typeOptions = ["addition", "deduction", "incoming", "outgoing"]

interface CreateTransactionFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function CreateTransactionForm({ onSuccess, onCancel }: CreateTransactionFormProps) {
  const { t } = useLanguage()
  const { createTransaction } = useTransactions()

  const fields: FieldConfig[] = [
    {
      name: "type",
      label: t("transaction.type", MODULE) || "Type",
      type: "select",
      required: true,
      options: typeOptions.map((opt) => ({
        value: opt,
        label: t(`transaction.type_${opt}`, MODULE) || opt,
      })),
    },
    {
      name: "value",
      label: t("transaction.value", MODULE) || "Value",
      type: "decimal",
      required: true,
      decimalPlaces: 2,
    },
    {
      name: "date",
      label: t("transaction.date", MODULE) || "Date",
      type: "date",
      required: false,
    },
    {
      name: "reason",
      label: t("transaction.reason", MODULE) || "Reason",
      type: "textarea",
      required: false,
    },
  ]

  return (
    <GenericCreateForm
      schema={getCreateTransactionFormSchema(t)}
      fields={fields}
      onSubmit={(data) => createTransaction({ ...data, status: "pending" })}
      onSuccess={() => onSuccess()}
      onCancel={onCancel}
      submitLabel={t("common.save", "shared") || "Save"}
    />
  )
}
