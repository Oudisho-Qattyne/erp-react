import { useEffect, useState } from "react"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { GenericCreateForm, type FieldConfig } from "../../../../core/presentation/layouts/ui/forms/GenericCreateForm"
import { useManageRoles } from "../../presentation/hooks/useManageRoles"
import { useManageUsers } from "../../presentation/hooks/user/userManageUsers"
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

  const fields: FieldConfig[] = [
    { name: "name", label: t("users.name", "users") || "Name", type: "alpha", required: true },
    { name: "email", label: t("users.email", "users") || "Email", type: "text", required: true },
    { name: "mobile", label: t("users.mobile", "users") || "Mobile", type: "numeric", required: true },
    {
      name: "role",
      label: t("users.role", "users") || "Role",
      type: "select",
      required: true,
      options: roles.map((r) => ({ value: r.name, label: r.display_name })),
    },
    // {
    //   name: "status",
    //   label: t("users.status", "users") || "Status",
    //   type: "select",
    //   required: true,
    //   options: [
    //     { value: "active", label: t("users.status_active", "users") || "Active" },
    //     { value: "inactive", label: t("users.status_inactive", "users") || "Inactive" },
    //     { value: "suspended", label: t("users.status_suspended", "users") || "Suspended" },
    //   ],
    // },
  ]

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
