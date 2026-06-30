import { useState } from "react"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { Button } from "../../../../../core/presentation/layouts/ui/buttons/Button"
import { SectionCard } from "../../../../../core/presentation/layouts/ui/card/SectionCard"
import { useHr } from "../../../../../core/registry/hr/HrProvider"
import { useManageUsers } from "../../hooks/user/userManageUsers"
import { UserPickerDialog } from "../../components/UserPickerDialog"
import type { EmployeeListItem } from "../../../../hr/domain/entities/EmployeeListItem"
import type { User } from "../../../domain/entities/user/user"
import { User as UserIcon, Briefcase, Link2, Mail, Phone, Shield, Calendar } from "lucide-react"

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-gray-100 text-gray-500 border-gray-200",
  suspended: "bg-danger/10 text-danger border-danger/20",
}

export function LinkUserToEmployee() {
  const { t, language } = useLanguage()
  const { EmployeePickerComponent } = useHr() || {}
  const { linkUserToEmployee, loading } = useManageUsers()

  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeListItem | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showEmployeePicker, setShowEmployeePicker] = useState(false)
  const [showUserPicker, setShowUserPicker] = useState(false)

  const handleLink = async () => {
    if (!selectedUser || !selectedEmployee) return
    await linkUserToEmployee(selectedUser.id, selectedEmployee.id)
    setSelectedEmployee(null)
    setSelectedUser(null)
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">{t("link_user.title", "users") || "Link User to Employee"}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("link_user.select_employee", "users") || "Select Employee"}</h2>
            <Button variant="outline" size="sm" onClick={() => setShowEmployeePicker(true)}>
              {selectedEmployee ? t("common.change", "shared") || "Change" : t("common.select", "shared") || "Select"}
            </Button>
          </div>

          <SectionCard
            title={t("link_user.selected_employee", "users") || "Selected Employee"}
            icon={<Briefcase size={18} />}
            empty={!selectedEmployee}
            emptyMessage={t("link_user.no_employee_selected", "users") || "No employee selected"}
            emptyIcon={<Briefcase size={24} />}
          >
            {selectedEmployee && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-border/50">
                  <UserIcon size={16} className="text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-text-muted">{t("employees.full_name", "hr") || "Full Name"}</p>
                    <p className="text-sm font-medium">{selectedEmployee.full_name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-border/50">
                    <Briefcase size={16} className="text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-text-muted">{t("employees.internal_id", "hr") || "Internal ID"}</p>
                      <p className="text-sm font-medium">{selectedEmployee.internal_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-border/50">
                    <Shield size={16} className="text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-text-muted">{t("employees.national_id", "hr") || "National ID"}</p>
                      <p className="text-sm font-medium">{selectedEmployee.national_id}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-border/50">
                  <Calendar size={16} className="text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-text-muted">{t("employees.created_at", "hr") || "Created At"}</p>
                    <p className="text-sm font-medium">{selectedEmployee.created_at}</p>
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("link_user.select_user", "users") || "Select User"}</h2>
            <Button variant="outline" size="sm" onClick={() => setShowUserPicker(true)}>
              {selectedUser ? t("common.change", "shared") || "Change" : t("common.select", "shared") || "Select"}
            </Button>
          </div>

          <SectionCard
            title={t("link_user.selected_user", "users") || "Selected User"}
            icon={<UserIcon size={18} />}
            empty={!selectedUser}
            emptyMessage={t("link_user.no_user_selected", "users") || "No user selected"}
            emptyIcon={<UserIcon size={24} />}
          >
            {selectedUser && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-border/50">
                  <UserIcon size={16} className="text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-text-muted">{t("users.name", "users") || "Name"}</p>
                    <p className="text-sm font-medium">{selectedUser.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-border/50">
                    <Mail size={16} className="text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-text-muted">{t("users.email", "users") || "Email"}</p>
                      <p className="text-sm font-medium">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-border/50">
                    <Phone size={16} className="text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-text-muted">{t("users.mobile", "users") || "Mobile"}</p>
                      <p className="text-sm font-medium">{selectedUser.mobile}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-border/50">
                    <Shield size={16} className="text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-text-muted">{t("users.role", "users") || "Role"}</p>
                      <p className="text-sm font-medium">{language === "ar" ? selectedUser.role?.display_name : selectedUser.role?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-border/50">
                    <Briefcase size={16} className="text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-text-muted">{t("users.status", "users") || "Status"}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border mt-0.5 ${statusStyles[selectedUser.status] || ""}`}>
                        {t(`users.status_${selectedUser.status}`, "users") || selectedUser.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          variant="primary"
          size="lg"
          leftIcon={<Link2 size={18} />}
          disabled={!selectedUser || !selectedEmployee}
          isLoading={loading.linkUserToEmployee}
          onClick={handleLink}
          requiredPermission="users.users.link-to-employee"
        >
          {t("link_user.link", "users") || "Link"}
        </Button>
      </div>

      {EmployeePickerComponent && (
        <EmployeePickerComponent
          isOpen={showEmployeePicker}
          onClose={() => setShowEmployeePicker(false)}
          onConfirm={(items) => { setSelectedEmployee(items[0]); setShowEmployeePicker(false) }}
          multiple={false}
          defaultFilter={{ linked_to_user: "false" }}
        />
      )}

      <UserPickerDialog
        isOpen={showUserPicker}
        onClose={() => setShowUserPicker(false)}
        onConfirm={(items) => { setSelectedUser(items[0]); setShowUserPicker(false) }}
        multiple={false}
        defaultFilter={{ linked_to_user: "false" }}
      />
    </div>
  )
}
