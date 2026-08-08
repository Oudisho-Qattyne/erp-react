import { useEffect, useState } from "react"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { GenericCreateForm } from "../../../../core/presentation/layouts/ui/forms/GenericCreateForm"
import { useManageRoles } from "../../presentation/hooks/useManageRoles"
import { useManageUsers } from "../../presentation/hooks/user/userManageUsers"
import { buildEditUserFormFields } from "../forms/userFormConfig"
import { getUpdateUserSchema } from "../schemas/user/userSchema"
import type { Role } from "../../domain/entities/role"
import type { User } from "../../domain/entities/user/user"

interface EditUserFormProps {
  user: User
  onSuccess: () => void
  onCancel: () => void
}

export function EditUserForm({ user, onSuccess, onCancel }: EditUserFormProps) {
  const { t } = useLanguage()
  const { getAll } = useManageRoles()
  const { updateUser } = useManageUsers()
  const [roles, setRoles] = useState<Role[]>([])

  useEffect(() => {
    getAll().then((res) => setRoles(res.data))
  }, [])

  const fields = buildEditUserFormFields(t, roles)

  const defaultValues = {
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role?.name || "",
    status: user.status,
  }

  return (
    <GenericCreateForm
      schema={getUpdateUserSchema(t)}
      fields={fields}
      defaultValues={defaultValues}
      onSubmit={(data) => updateUser(user.id, data)}
      onSuccess={(_id, _item) => onSuccess()}
      onCancel={onCancel}
      submitLabel={t("common.save", "shared") || "Save"}
    />
  )
}
