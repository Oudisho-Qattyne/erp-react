import { useState } from "react"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { Dialog } from "../../../../core/presentation/layouts/ui/dialog/Dialog"
import { Button } from "../../../../core/presentation/layouts/ui/buttons/Button"
import { SectionCard } from "../../../../core/presentation/layouts/ui/card/SectionCard"
import { EditUserForm } from "./EditUserForm"
import type { User } from "../../domain/entities/user/user"
import { User as UserIcon, Shield, Calendar, Mail, Phone } from "lucide-react"

interface ShowUserDialogProps {
  user: User
  isOpen: boolean
  onClose: () => void
  startEditing?: boolean
}

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-gray-100 text-gray-500 border-gray-200",
  suspended: "bg-danger/10 text-danger border-danger/20",
}

export function ShowUserDialog({ user, isOpen, onClose, startEditing = false }: ShowUserDialogProps) {
  const { t, language } = useLanguage()
  const [isEditing, setIsEditing] = useState(startEditing)

  if (isEditing) {
    return (
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        title={t("edit_user.title", "users") || "Edit User"}
        size="md"
      >
        <EditUserForm
          user={user}
          onSuccess={() => { setIsEditing(false); onClose() }}
          onCancel={() => setIsEditing(false)}
        />
      </Dialog>
    )
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t("show_user.title", "users") || "User Details"}
      size="xl"
      actions={
        <Button variant="primary" onClick={() => setIsEditing(true)} requiredPermission="users.users.edit">
          {t("show_user.edit", "users") || "Edit User"}
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-card/60 rounded-2xl border border-border">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border-4 border-card">
            <UserIcon size={28} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${statusStyles[user.status] || ""}`}>
                {t(`users.status_${user.status}`, "users") || user.status}
              </span>
              <span className="text-sm text-text-muted">{user.role?.display_name || user.role?.name}</span>
            </div>
          </div>
        </div>

        <SectionCard title={t("users.user_info", "users") || "User Information"} icon={<UserIcon size={18} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-border/50">
              <Mail size={16} className="text-primary shrink-0" />
              <div>
                <p className="text-xs text-text-muted">{t("users.email", "users") || "Email"}</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-border/50">
              <Phone size={16} className="text-primary shrink-0" />
              <div>
                <p className="text-xs text-text-muted">{t("users.mobile", "users") || "Mobile"}</p>
                <p className="text-sm font-medium">{user.mobile}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-border/50">
              <Shield size={16} className="text-primary shrink-0" />
              <div>
                <p className="text-xs text-text-muted">{t("users.role", "users") || "Role"}</p>
                <p className="text-sm font-medium">{language === "ar" ? user.role?.display_name : user.role?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-border/50">
              <Calendar size={16} className="text-primary shrink-0" />
              <div>
                <p className="text-xs text-text-muted">{t("users.created_at", "users") || "Created At"}</p>
                <p className="text-sm font-medium">{user.created_at}</p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* <SectionCard
          title={t("users.permissions", "users") || "Permissions"}
          icon={<Shield size={18} />}
          empty={!user.permissions || user.permissions.length === 0}
          emptyMessage={t("users.no_permissions", "users") || "No permissions assigned"}
          emptyIcon={<Shield size={24} />}
        >
          <div className="flex flex-wrap gap-2">
            {user.permissions?.map((perm) => (
              <span
                key={perm}
                className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20"
              >
                {perm}
              </span>
            ))}
          </div>
        </SectionCard> */}
      </div>
    </Dialog>
  )
}
