import { useEffect, useState } from "react"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { GenericCreateForm, type FieldConfig } from "../../../../core/presentation/layouts/ui/forms/GenericCreateForm"
import { useManageRoles } from "../../presentation/hooks/useManageRoles"
import { useManageUsers } from "../../presentation/hooks/user/userManageUsers"
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

  const fields: FieldConfig[] = [
    { name: "name", label: t("users.name", "users") || "Name", type: "text", required: true },
    { name: "email", label: t("users.email", "users") || "Email", type: "text", required: true },
    { name: "mobile", label: t("users.mobile", "users") || "Mobile", type: "text", required: true },
    {
      name: "role",
      label: t("users.role", "users") || "Role",
      type: "select",
      required: true,
      options: roles.map((r) => ({ value: r.name, label: r.display_name  })),
    },
    { name: "password", label: t("users.password", "users") || "Password", type: "password", required: true },
    { name: "confirmPassword", label: t("users.confirm_password", "users") || "Confirm Password", type: "password", required: true },
  ]

  return (
    <GenericCreateForm
      schema={getCreateUserSchema(t)}
      fields={fields}
      onSubmit={(data) => createUser(data )}
      onSuccess={(_id, _item) => onSuccess()}
      onCancel={onCancel}
      submitLabel={t("common.save", "shared") || "Save"}
    />
  )
}
