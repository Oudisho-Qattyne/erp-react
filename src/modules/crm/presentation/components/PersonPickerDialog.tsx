import { useEffect } from "react"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { SelectFromTable } from "../../../../core/presentation/layouts/ui/picker/SelectFromTable"
import type { ColumnDef } from "../../../../core/presentation/layouts/ui/tables/ResizableTable"
import type { Person } from "../../domain/entities/Person"
import type { PersonSearchResult } from "../../../../core/registry/person/personRegistry"
import { usePersons } from "../hooks/usePersons"

interface PersonPickerDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selected: PersonSearchResult[]) => void
  multiple?: boolean
  initialSelected?: PersonSearchResult[]
  defaultFilter?: Record<string, any>
}

export function PersonPickerDialog({
  isOpen,
  onClose,
  onConfirm,
  multiple = false,
  initialSelected = [],
  defaultFilter,
}: PersonPickerDialogProps) {
  const { t } = useLanguage()
  const {
    persons,
    loading,
    error,
    pagination,
    filter,
    sortColumn,
    sortOrder,
    setPage,
    setFilter,
    setSort,
    resetFilter,
    findAllPersons,
  } = usePersons()

  useEffect(() => {
    if (isOpen) findAllPersons()
  }, [isOpen, filter])

  const columns: ColumnDef<Person>[] = [
    { key: "id", label: "#", width: 60 },
    { key: "name", label: t("persons.person_name", "crm") || "Name", width: 200, sortable: true },
    { key: "email", label: t("persons.email", "crm") || "Email", width: 220 },
    { key: "primary_phone_number", label: t("persons.primary_phone", "crm") || "Primary Phone", width: 170 },
    { key: "whatsapp", label: t("persons.whatsapp", "crm") || "WhatsApp", width: 150 },
  ]

  const handleSort = (column: string) => {
    if (column !== "name" && column !== "email") return
    setSort(column)
  }

  const initialRows = initialSelected.map(
    (p) =>
      ({
        id: p.id,
        name: p.name,
        email: p.email,
        primary_phone_number: p.primary_phone_number,
        whatsapp: p.whatsapp,
        facebook: p.facebook,
      }) as Person
  )

  return (
    <SelectFromTable
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={(selected: Person[]) => {
        onConfirm(
          selected.map((p) => ({
            id: p.id,
            name: p.name,
            email: p.email,
            primary_phone_number: p.primary_phone_number,
            whatsapp: p.whatsapp,
            facebook: p.facebook,
          }))
        )
      }}
      title={t("persons.picker_title", "crm") || "Select Persons"}
      multiple={multiple}
      initialSelected={initialRows}
      defaultFilter={defaultFilter}
      onApplyDefaultFilter={(parsed) => setFilter(parsed as any)}
      data={persons}
      columns={columns}
      isLoading={loading.findAllPersons}
      error={error.findAllPersons}
      onRetry={findAllPersons}
      onSearch={(query) => setFilter({ search: query, page: 1 })}
      searchPlaceholder={t("persons.search_placeholder", "crm") || "Search..."}
      filterFields={[]}
      filterValues={filter}
      onApplyFilter={() => {}}
      onResetFilter={resetFilter}
      sortColumn={sortColumn}
      sortOrder={sortOrder}
      onSort={handleSort}
      page={pagination.currentPage}
      perPage={Number(filter.per_page) || 10}
      totalPages={pagination.lastPage}
      totalItems={pagination.total}
      onPageChange={setPage}
      onPerPageChange={(size) => setFilter({ per_page: size, page: 1 })}
      emptyMessage={t("persons.no_data", "crm") || "No persons found"}
    />
  )
}