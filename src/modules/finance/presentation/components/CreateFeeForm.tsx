import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { GenericCreateForm } from "../../../../core/presentation/layouts/ui/forms/GenericCreateForm"
import { getCreateFeeFormSchema } from "../schemas/feeForm.schema"
import { useFees } from "../hooks/useFees"
import { buildCreateFeeFormFields } from "../forms/feeFormConfig"

interface CreateFeeFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function CreateFeeForm({ onSuccess, onCancel }: CreateFeeFormProps) {
  const { t } = useLanguage()
  const { createFee } = useFees()

  const fields = buildCreateFeeFormFields(t)

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
