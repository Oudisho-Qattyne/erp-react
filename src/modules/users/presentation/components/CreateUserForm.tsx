import { useEffect, useState } from "react"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { GenericCreateForm } from "../../../../core/presentation/layouts/ui/forms/GenericCreateForm"
import { useManageRoles } from "../../presentation/hooks/useManageRoles"
import { useManageUsers } from "../../presentation/hooks/user/userManageUsers"
import { buildCreateUserFormFields, buildUserFormGroups } from "../forms/userFormConfig"
import { getCreateUserSchema } from "../schemas/user/userSchema"
import type { Role } from "../../domain/entities/role"

interface CreateUserFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function CreateUserForm({ onSuccess, onCancel }: CreateUserFormProps) {
  const { t } = useLanguage()
  const { getAll } = useManageRoles()
  const { createUser } = useManageUsers()
  const [roles, setRoles] = useState<Role[]>([])

  useEffect(() => {
    getAll().then((res) => setRoles(res.data))
  }, [])

  const fields = buildCreateUserFormFields(t, roles)
  const formGroups = buildUserFormGroups(t)

  return (
    <GenericCreateForm
      schema={getCreateUserSchema(t)}
      fields={fields}
      groups={formGroups}
      onSubmit={(data) => createUser(data )}
      onSuccess={(_id, _item) => onSuccess()}
      onCancel={onCancel}
      submitLabel={t("common.save", "shared") || "Save"}
    />
  )
}
