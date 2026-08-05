import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { GenericCreateForm, type FieldConfig } from "../../../../core/presentation/layouts/ui/forms/GenericCreateForm"
import { getCreateFeeFormSchema } from "../schemas/feeForm.schema"
import { useFees } from "../hooks/useFees"

interface CreateFeeFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function CreateFeeForm({ onSuccess, onCancel }: CreateFeeFormProps) {
  const { t } = useLanguage()
  const { createFee } = useFees()

  const fields: FieldConfig[] = [
    { name: "name", label: t("fee.name", "finance") || "Name", type: "alpha", required: true },
    { name: "code", label: t("fee.code", "finance") || "Code", type: "alphanumeric", required: true },
    {
      name: "fee_value",
      label: t("fee.fee_value", "finance") || "Fee Value",
      type: "decimal",
      required: true,
      decimalPlaces: 2,
    },
    {
      name: "fee_status",
      label: t("fee.fee_status", "finance") || "Status",
      type: "select",
      required: true,
      options: [
        { value: "active", label: t("fee.status_active", "finance") || "Active" },
        { value: "archived", label: t("fee.status_archived", "finance") || "Archived" },
      ],
    },
  ]

  return (
    <GenericCreateForm
      schema={getCreateFeeFormSchema(t)}
      fields={fields}
      onSubmit={(data) => createFee(data)}
      onSuccess={() => onSuccess()}
      onCancel={onCancel}
      submitLabel={t("common.save", "shared") || "Save"}
    />
  )
}
