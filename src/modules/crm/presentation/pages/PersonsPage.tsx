import { useEffect, useState } from "react"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { Button } from "../../../../core/presentation/layouts/ui/buttons/Button"
import { DataTable, type ColumnDef } from "../../../../core/presentation/layouts/ui/tables/ResizableTable"
import { ErrorState } from "../../../../core/presentation/layouts/ui/state/ErrorState"
import { FilterDialog, type FilterField } from "../../../../core/presentation/layouts/ui/filter/FilterDialog"
import Input from "../../../../core/presentation/layouts/ui/inputs/Input"
import { inputBaseClasses } from "../../../../core/presentation/layouts/ui/inputs/styles"
import { usePersons } from "../hooks/usePersons"
import type { Person } from "../../domain/entities/Person"
import type { PersonFilters } from "../../application/dtos/personDtos"
import { Search, Filter } from "lucide-react"

const MODULE = "crm"

export function PersonsPage() {
  const { t } = useLanguage()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState("")

  const {
    persons,
    loading,
    error,
    pagination,
    filter,
    setFilter,
    resetFilter,
    findAllPersons,
  } = usePersons()

  const handleSearch = () => {
    setFilter({ search: localSearch, page: 1 })
  }

  useEffect(() => {
    findAllPersons()
  }, [filter])

  const columns: ColumnDef<Person>[] = [
    { key: "id", label: "#", width: 60 },
    { key: "name", label: t("persons.person_name", MODULE) || "Name", width: 180, sortable: true },
    { key: "primary_phone", label: t("persons.primary_phone", MODULE) || "Primary Phone", width: 150 },
    { key: "secondary_phone", label: t("persons.secondary_phone", MODULE) || "Secondary Phone", width: 150 },
    { key: "email", label: t("persons.email", MODULE) || "Email", width: 180 },
    { key: "whatsapp", label: t("persons.whatsapp", MODULE) || "WhatsApp", width: 150 },
    { key: "telegram", label: t("persons.telegram", MODULE) || "Telegram", width: 130 },
    { key: "x", label: t("persons.x", MODULE) || "X", width: 120 },
    { key: "linkedin", label: t("persons.linkedin", MODULE) || "LinkedIn", width: 150 },
  ]

  const filterFields: FilterField[] = [
    { name: "name", type: "text", label: t("persons.person_name", MODULE) || "Name" },
    { name: "phone", type: "text", label: t("persons.phone", MODULE) || "Phone" },
    { name: "email", type: "text", label: t("persons.email", MODULE) || "Email" },
    { name: "address", type: "text", label: t("persons.address", MODULE) || "Address" },
  ]

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Partial<PersonFilters> = { page: 1, per_page: filter.per_page }
    for (const [key, val] of Object.entries(values)) {
      if (val !== "" && val !== undefined) parsed[key as keyof PersonFilters] = val as any
    }
    setFilter(parsed)
    setIsFilterOpen(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("persons.title", MODULE) || "Persons"}</h1>
      </div>

      {error.findAllPersons ? (
        <ErrorState message={error.findAllPersons} onRetry={() => findAllPersons()} />
      ) : (
        <div className="relative w-full">
          <div className="relative flex gap-3 py-3">
            <div className="relative flex-1 max-w-sm">
              <Input
                type="text"
                placeholder={t("persons.search_placeholder", MODULE) || "Search by name, phone, email, or address..."}
                value={localSearch}
                onChange={(val) => setLocalSearch(val as string)}
                baseClasses={inputBaseClasses}
              />
            </div>
            <Button variant="primary" size="sm" onClick={handleSearch} leftIcon={<Search size={14} />}>
              {t("common.search", "shared") || "Search"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)} leftIcon={<Filter size={14} />}>
              {t("common.filter", "shared") || "Filter"}
            </Button>
            <Button variant="outline" size="sm" onClick={resetFilter}>
              {t("common.reset", "shared") || "Reset"}
            </Button>
          </div>

          <FilterDialog
            isOpen={isFilterOpen}
            fields={filterFields}
            initialValues={filter}
            onFilter={handleApplyFilter}
            onCancel={() => setIsFilterOpen(false)}
            onReset={() => { resetFilter(); setIsFilterOpen(false) }}
          />

          <DataTable
            columns={columns}
            data={persons}
            rowKey="id"
            onRowClick={() => {}}
            loading={loading.findAllPersons}
            emptyMessage={t("persons.no_data", MODULE) || "No persons found"}
            pagination={{
              page: pagination.currentPage,
              totalPages: pagination.lastPage,
              totalItems: pagination.total,
              itemsPerPage: Number(filter.per_page) || 10,
              onPageChange: (page) => setFilter({ page }),
              onItemsPerPageChange: (size) => setFilter({ per_page: size, page: 1 }),
              itemsPerPageOptions: [10, 25, 50, 100],
            }}
          />
        </div>
      )}
    </div>
  )
}