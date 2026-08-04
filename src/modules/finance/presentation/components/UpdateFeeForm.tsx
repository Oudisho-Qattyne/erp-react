import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { GenericCreateForm, type FieldConfig } from "../../../../core/presentation/layouts/ui/forms/GenericCreateForm"
import { getUpdateFeeFormSchema } from "../schemas/feeForm.schema"
import { useFees } from "../hooks/useFees"
import type { Fee } from "../../domain/entities/Fee"

interface UpdateFeeFormProps {
  fee: Fee
  onSuccess: () => void
  onCancel: () => void
}

export function UpdateFeeForm({ fee, onSuccess, onCancel }: UpdateFeeFormProps) {
  const { t } = useLanguage()
  const { updateFee } = useFees()

  const fields: FieldConfig[] = [
    { name: "name", label: t("fee.name", "finance") || "Name", type: "alpha", required: true },
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
      schema={getUpdateFeeFormSchema(t)}
      fields={fields}
      defaultValues={{ name: fee.name, fee_status: fee.fee_status }}
      onSubmit={(data) => updateFee(fee.id, data)}
      onSuccess={() => onSuccess()}
      onCancel={onCancel}
      submitLabel={t("common.save", "shared") || "Save"}
    />
  )
}
