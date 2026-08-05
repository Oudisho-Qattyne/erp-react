import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { GenericCreateForm, type FieldConfig } from "../../../../core/presentation/layouts/ui/forms/GenericCreateForm"
import type { PickerConfig } from "../../../../core/presentation/layouts/ui/picker/pickerTypes"
import { getCreateTransactionFormSchema } from "../schemas/transactionForm.schema"
import { useTransactions } from "../hooks/useTransactions"

const MODULE = "finance"

const typeOptions = ["incoming", "outgoing"]

interface CreateTransactionFormProps {
  onSuccess: () => void
  onCancel: () => void
}

// Which picker dialog appears depends on the chosen transactionable_type.
// "general" (default) has no dialog. Future types each map to their own table config.
function pickerConfigForTransactionableType(
  transactionableType: string | undefined,
): PickerConfig | null {
  switch (transactionableType) {
    // case "employee":
    //   return { data: [], columns: [], initialFilter: {} }
    default:
      return null
  }
}

export function CreateTransactionForm({ onSuccess, onCancel }: CreateTransactionFormProps) {
  const { t } = useLanguage()
  const { createTransaction } = useTransactions()

  const fields: FieldConfig[] = [
    {
      name: "transaction_type",
      label: t("transaction.type", MODULE) || "Type",
      type: "select",
      required: true,
      options: typeOptions.map((opt) => ({
        value: opt,
        label: t(`transaction.type_${opt}`, MODULE) || opt,
      })),
    },
    {
      name: "transaction_value",
      label: t("transaction.value", MODULE) || "Value",
      type: "decimal",
      required: true,
      decimalPlaces: 2,
    },
    {
      name: "transaction_date",
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
    {
      name: "transactionable_type",
      label: t("transaction.transactionable_type", MODULE) || "Transactionable Type",
      type: "select",
      required: false,
      options: [
        {
          value: "general",
          label: t("transaction.transactionable_type_general", MODULE) || "General",
        },
      ],
    },
    {
      name: "transactionable_id",
      label: t("transaction.transactionable_id", MODULE) || "Transactionable",
      type: "table-picker",
      required: false,
      dependsOn: ["transactionable_type"],
      compute: (values) => ({
        pickerConfig: pickerConfigForTransactionableType(values.transactionable_type),
      }),
    },
  ]

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
