import { useEffect, useState } from "react"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { GenericCreateForm } from "../../../../core/presentation/layouts/ui/forms/GenericCreateForm"
import { useManageRoles } from "../../presentation/hooks/useManageRoles"
import { useManageUsers } from "../../presentation/hooks/user/userManageUsers"
import { buildChangePasswordFormFields, buildEditUserFormFields } from "../forms/userFormConfig"
import { getChangePasswordSchema, getUpdateUserSchema } from "../schemas/user/userSchema"
import type { Role } from "../../domain/entities/role"
import type { User } from "../../domain/entities/user/user"

interface ChangePasswordProps {
  user: User
  onSuccess: () => void
  onCancel: () => void
}

export function ChangePassword({ user, onSuccess, onCancel }: ChangePasswordProps) {
  const { t } = useLanguage()
  const { getAll } = useManageRoles()
  const { updateUser , changePassword } = useManageUsers()
  const [roles, setRoles] = useState<Role[]>([])

  useEffect(() => {
    getAll().then((res) => setRoles(res.data))
  }, [])

  const fields = buildChangePasswordFormFields(t, roles)

  const defaultValues = {
    password:'',
    confirmPassword:''
  }

  return (
    <GenericCreateForm
      schema={getChangePasswordSchema(t)}
      fields={fields}
      defaultValues={defaultValues}
      onSubmit={(data) => changePassword(user.id, data)}
      onSuccess={(_id, _item) => onSuccess()}
      onCancel={onCancel}
      submitLabel={t("common.save", "shared") || "Save"}
    />
  )
}
