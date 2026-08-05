import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { Button } from "../../../../core/presentation/layouts/ui/buttons/Button"
import { DataTable, type ColumnDef } from "../../../../core/presentation/layouts/ui/tables/ResizableTable"
import { ErrorState } from "../../../../core/presentation/layouts/ui/state/ErrorState"
import { FilterDialog, type FilterField } from "../../../../core/presentation/layouts/ui/filter/FilterDialog"
import Input from "../../../../core/presentation/layouts/ui/inputs/Input"
import { inputBaseClasses } from "../../../../core/presentation/layouts/ui/inputs/styles"
import { usePersonDetails } from "../../../../core/registry/person/PersonProvider"
import { usePersons } from "../hooks/usePersons"
import type { Person } from "../../domain/entities/Person"
import type { PersonFilters } from "../../application/dtos/personDtos"
import { Search, Filter, Eye } from "lucide-react"

const MODULE = "crm"

export function PersonsPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const personDetails = usePersonDetails()
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
    { key: "id", label: "#", width: 60, align: "center", render: (row) => row.id },
    { key: "name", label: t("persons.person_name", MODULE) || "Name", width: 180, sortable: true, align: "center", render: (row) => row.name || "—" },
    {
      key: "type",
      label: t("persons.type", MODULE) || "Type",
      width: 120,
      align: "center",
      render: (row) =>
        row.type === "investor"
          ? t("persons.type_investor", MODULE) || "Investor"
          : row.type === "employee"
            ? t("persons.type_employee", MODULE) || "Employee"
            : "—",
    },
    { key: "primary_phone_number", label: t("persons.primary_phone", MODULE) || "Primary Phone", width: 170, align: "center", render: (row) => row.primary_phone_number || "—" },
    { key: "email", label: t("persons.email", MODULE) || "Email", width: 180, align: "center", render: (row) => row.email || "—" },
    { key: "whatsapp", label: t("persons.whatsapp", MODULE) || "WhatsApp", width: 150, align: "center", render: (row) => row.whatsapp || "—" },
    {
      key: "actions",
      label: "",
      width: 90,
      align: "center",
      render: (row) => {
        const config = personDetails.getPersonDetailRoute(row.type)
        if (!config) return null
        return (
          <Button
            variant="outline"
            size="sm"
            requiredPermission={config.permission}
            onClick={(e) => {
              e.stopPropagation()
              navigate(config.resolve(row.id))
            }}
          >
            <Eye size={14} />
            {t("common.view", "shared") || "View"}
          </Button>
        )
      },
    },
  ]

  const filterFields: FilterField[] = [
    { name: "name", type: "text", label: t("persons.person_name", MODULE) || "Name" },
    { name: "primary_phone_number", type: "text", label: t("persons.primary_phone", MODULE) || "Primary Phone" },
    { name: "secondary_phone_number", type: "text", label: t("persons.secondary_phone", MODULE) || "Secondary Phone" },
    { name: "whatsapp", type: "text", label: t("persons.whatsapp", MODULE) || "WhatsApp" },
    { name: "email", type: "text", label: t("persons.email", MODULE) || "Email" },
    {
      name: "type",
      type: "select",
      label: t("persons.type", MODULE) || "Type",
      options: [
        { value: "employee", label: t("persons.type_employee", MODULE) || "Employee" },
        { value: "investor", label: t("persons.type_investor", MODULE) || "Investor" },
      ],
    },
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
                placeholder={t("persons.search_placeholder", MODULE) || "Search by name, phone, email, or whatsapp..."}
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