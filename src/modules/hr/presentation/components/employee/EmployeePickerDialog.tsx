import { useState } from "react"
import { useEmployee } from "../../hooks/employee/useEmployee"
import { useEntityCrud, useFaculties, useSpecializations } from "../../hooks"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { SelectFromTable } from "../../../../../core/presentation/layouts/ui/picker/SelectFromTable"
import type { ColumnDef } from "../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import type { EmployeeListItem } from "../../../domain/entities/EmployeeListItem"
import type { University } from "../../../../../core/domain/entities/education/University"
import type { OrganizationalLevels } from "../../../../../core/domain/entities/organizationalLevels/organizationalLevels"
import type { MultiLanguage } from "../../../../../core/domain/entities/EntityWithNameOnly"

interface EmployeePickerDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selected: EmployeeListItem[]) => void
  multiple?: boolean
  initialSelected?: EmployeeListItem[]
  defaultFilter?: Record<string, any>
}

export function EmployeePickerDialog({
  isOpen,
  onClose,
  onConfirm,
  multiple = false,
  initialSelected = [],
  defaultFilter,
}: EmployeePickerDialogProps) {
  const { t } = useLanguage()
  const { employees, loading, error, pagination, filter, setSearch, setPage, setFilter, resetFilter, findAllEmployees } = useEmployee()
  const { getAll: loadUniversities } = useEntityCrud<University>('/shared-kernal/universities', '/shared-kernal/universities')
  const { getAllByUniversity } = useFaculties()
  const { getAllByFaculty } = useSpecializations()
  const { getAll: loadOrgUnits } = useEntityCrud<OrganizationalLevels>('/hr/organizational-levels', '/hr/organizational-levels')

  const [sortBy, setSortBy] = useState<string | undefined>(undefined)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const SORT_FIELD_MAP: Record<string, string> = {
    full_name: "first_name",
    created_at: "created_at",
  }

  const getLocalizedName = (name: string | MultiLanguage) =>
    typeof name === "string" ? name : (name.ar || name.en || "")

  const computeUniversities = async () => {
    const response = await loadUniversities()
    return { options: [{ value: "", label: t("common.all", "shared") || "All" }, ...response.data.map((u) => ({ value: u.id, label: getLocalizedName(u.name) }))] }
  }

  const computeFaculties = async (values: Record<string, unknown>) => {
    const univId = values.university_id
    if (!univId) return { options: [{ value: "", label: t("common.all", "shared") || "All" }], disabled: true }
    const response = await getAllByUniversity(Number(univId))
    return { options: [{ value: "", label: t("common.all", "shared") || "All" }, ...response.data.map((f) => ({ value: f.id, label: getLocalizedName(f.name) }))] }
  }

  const computeSpecializations = async (values: Record<string, unknown>) => {
    const facId = values.faculty_id
    if (!facId) return { options: [{ value: "", label: t("common.all", "shared") || "All" }], disabled: true }
    const response = await getAllByFaculty(Number(facId))
    return { options: [{ value: "", label: t("common.all", "shared") || "All" }, ...response.data.map((s) => ({ value: s.id, label: getLocalizedName(s.name) }))] }
  }

  const computeOrgUnits = async () => {
    const response = await loadOrgUnits()
    return { options: [{ value: "", label: t("common.all", "shared") || "All" }, ...response.data.map((o) => ({ value: o.id, label: getLocalizedName(o.name) }))] }
  }

  const handleSort = (columnKey: string) => {
    const field = SORT_FIELD_MAP[columnKey]
    if (!field) return
    const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc"
    setSortBy(field)
    setSortOrder(newOrder)
    setFilter({ [`sort_by[${field}]`]: newOrder } as any)
  }

  const columns: ColumnDef<EmployeeListItem>[] = [
    { key: "personal_id_number", label: t("employees.personal_id_number", "hr"), width: 100 },
    { key: "full_name", label: t("employees.full_name", "hr"), width: 200, sortable: true },
    { key: "national_id", label: t("employees.national_id", "hr"), width: 150 },
    { key: "gender", label: t("employees.gender", "hr"), width: 80 },
    { key: "created_at", label: t("employees.created_at", "hr"), width: 120, sortable: true },
  ]

  const filterFields = [
    { name: "gender", label: t("employees.gender", "hr"), type: "select" as const, options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "male", label: t("employees.gender_male", "hr") },
      { value: "female", label: t("employees.gender_female", "hr") },
    ]},
    { name: "marital_status", label: t("employees.marital_status", "hr"), type: "select" as const, options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "single", label: t("employees.marital_single", "hr") },
      { value: "married", label: t("employees.marital_married", "hr") },
      { value: "divorced", label: t("employees.marital_divorced", "hr") },
      { value: "widowed", label: t("employees.marital_widowed", "hr") },
    ]},
    { name: "blood_type", label: t("employees.blood_type", "hr"), type: "select" as const, options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "A+", label: "A+" }, { value: "A-", label: "A-" },
      { value: "B+", label: "B+" }, { value: "B-", label: "B-" },
      { value: "AB+", label: "AB+" }, { value: "AB-", label: "AB-" },
      { value: "O+", label: "O+" }, { value: "O-", label: "O-" },
    ]},
    { name: "date_birth", label: t("employees.date_birth", "hr"), type: "date" as const },
    { name: "has_sham_cash_account", label: t("employees.has_sham_cash_account", "hr"), type: "select" as const, options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "true", label: t("common.yes", "shared") },
      { value: "false", label: t("common.no", "shared") },
    ]},
    { name: "linked_to_user", label: t("employees.linked_to_user", "hr") || "Linked to User", type: "select" as const, options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "true", label: t("common.yes", "shared") },
      { value: "false", label: t("common.no", "shared") },
    ]},
    { name: "university_id", type: "select" as const, searchable: true, label: t("employees.university", "hr"), compute: computeUniversities },
    { name: "faculty_id", type: "select" as const, searchable: true, label: t("employees.faculty", "hr"), dependsOn: ["university_id"], compute: computeFaculties },
    { name: "specialization_id", type: "select" as const, searchable: true, label: t("employees.specialization", "hr"), dependsOn: ["faculty_id"], compute: computeSpecializations },
    { name: "organizational_unit", type: "select" as const, searchable: true, label: t("employees.org_unit_id", "hr") || "Organizational Unit", compute: computeOrgUnits },
  ]

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = { page: 1, per_page: filter.per_page }
    for (const [key, val] of Object.entries(values)) {
      if (val !== "" && val !== undefined) {
        if (["university_id", "faculty_id", "specialization_id", "organizational_unit"].includes(key)) {
          parsed[key] = Number(val)
        } else {
          parsed[key] = val
        }
      }
    }
    setFilter(() => parsed as any)
  }

  return (
    <SelectFromTable
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("employees.picker_title", "hr") || "Select Employees"}
      multiple={multiple}
      initialSelected={initialSelected}
      defaultFilter={defaultFilter}
      onApplyDefaultFilter={(parsed) => setFilter(parsed as any)}
      data={employees}
      columns={columns}
      isLoading={loading.findAllEmployees}
      error={error.findAllEmployees}
      onSearch={(query) => setSearch(query)}
      searchPlaceholder={t("employees.search_placeholder", "hr") || "Search..."}
      searchInitialValue={filter.search || ""}
      filterFields={filterFields}
      filterValues={filter}
      onApplyFilter={handleApplyFilter}
      onResetFilter={resetFilter}
      sortColumn={sortBy}
      sortOrder={sortOrder}
      onSort={handleSort}
      page={pagination.currentPage}
      perPage={filter.per_page}
      totalPages={pagination.lastPage}
      totalItems={pagination.total}
      onPageChange={setPage}
      onPerPageChange={(size) => setFilter({ per_page: size, page: 1 })}
      emptyMessage={t("employees.no_data", "hr") || "No employees found"}
    />
  )
}
