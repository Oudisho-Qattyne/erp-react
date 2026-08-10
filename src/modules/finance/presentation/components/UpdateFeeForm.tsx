import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { GenericCreateForm } from "../../../../core/presentation/layouts/ui/forms/GenericCreateForm"
import { getUpdateFeeFormSchema } from "../schemas/feeForm.schema"
import { useFees } from "../hooks/useFees"
import type { Fee } from "../../domain/entities/Fee"
import { buildFeeDefaultValues, buildUpdateFeeFormFields } from "../forms/feeFormConfig"

interface UpdateFeeFormProps {
  fee: Fee
  onSuccess: () => void
  onCancel: () => void
}

export function UpdateFeeForm({ fee, onSuccess, onCancel }: UpdateFeeFormProps) {
  const { t } = useLanguage()
  const { updateFee } = useFees()

  const fields = buildUpdateFeeFormFields(t)

  return (
    <GenericCreateForm
      schema={getUpdateFeeFormSchema(t)}
      fields={fields}
      defaultValues={buildFeeDefaultValues(fee)}
      onSubmit={(data) => updateFee(fee.id, data)}
      onSuccess={() => onSuccess()}
      onCancel={onCancel}
      submitLabel={t("common.save", "shared") || "Save"}
    />
  )
}
