import { useState, useEffect } from "react"
import { useEntityCrud } from "../../../../../../core/presentation/hooks/data/useEntity"
import { useLanguage } from "../../../../../../core/presentation/context/i18n/I18nProvider"
import { SelectFromTable } from "../../../../../../core/presentation/layouts/ui/picker/SelectFromTable"
import type { ColumnDef } from "../../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import type { FilterField } from "../../../../../../core/presentation/layouts/ui/filter/FilterDialog"
import type { Facility } from "../../../../domain/entities/facility"
import type { PartnershipType } from "../../../../domain/entities/partnershipType"
import type { Country } from "../../../../../../core/domain/entities/regions/Country"
import { getLocalizedName } from "../../../../../../core/presentation/utils/helpes"

interface FacilityPickerDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selected: Facility[]) => void
  multiple?: boolean
  initialSelected?: Facility[]
  defaultFilter?: Record<string, any>
}

export function FacilityPickerDialog({
  isOpen,
  onClose,
  onConfirm,
  multiple = false,
  initialSelected = [],
  defaultFilter,
}: FacilityPickerDialogProps) {
  const { t } = useLanguage()
  const { entities: facilities, getAll, loadingMap, errorMap, pagination } = useEntityCrud<Facility>('/investments/facilities', '/investments/facilities')
  const { entities: partnershipTypes, getAll: getPartnershipTypes } = useEntityCrud<PartnershipType>('/investments/partnership-types', '/investments/partnership-types')
  const { entities: countries, getAll: loadCountries } = useEntityCrud<Country>('/shared-kernal/countries', '/shared-kernal/countries')

  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const [filterValues, setFilterValues] = useState<Record<string, any>>({})
  const [sortColumn, setSortColumn] = useState<"name" | "created_at" | "">("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    getPartnershipTypes('/investments/partnership-types?is_active=true')
    loadCountries('/shared-kernal/countries')
  }, [])

  const fetchFacilities = (params: Record<string, any> = {}) => {
    const sp = new URLSearchParams()
    if (params.search) sp.append("search", params.search)
    if (params.sortColumn) sp.append(`sort_by[${params.sortColumn}]`, params.sortOrder)
    if (params.page) sp.append("page", String(params.page))
    if (params.per_page) sp.append("per_page", String(params.per_page))
    Object.entries(params).forEach(([k, v]) => {
      if (!["search", "sortColumn", "sortOrder", "page", "per_page"].includes(k) && v !== "" && v !== undefined) {
        sp.append(k, String(v))
      }
    })
    getAll(`/investments/facilities?${sp.toString()}`)
  }

  useEffect(() => {
    if (isOpen) {
      fetchFacilities({ page: 1, per_page: perPage })
    }
  }, [isOpen])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(1)
    fetchFacilities({ ...filterValues, search: query, sortColumn, sortOrder, page: 1, per_page: perPage })
  }

  const handleSort = (column: string) => {
    if (column !== "name" && column !== "created_at") return
    const newOrder = sortColumn === column && sortOrder === "asc" ? "desc" : "asc"
    setSortColumn(column)
    setSortOrder(newOrder)
    fetchFacilities({ ...filterValues, search: searchQuery, sortColumn: column, sortOrder: newOrder, page: 1, per_page: perPage })
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchFacilities({ ...filterValues, search: searchQuery, sortColumn, sortOrder, page: newPage, per_page: perPage })
  }

  const handlePerPageChange = (size: number) => {
    setPerPage(size)
    setPage(1)
    fetchFacilities({ ...filterValues, search: searchQuery, sortColumn, sortOrder, page: 1, per_page: size })
  }

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = {}
    for (const [key, val] of Object.entries(values)) {
      if (val === "" || val === undefined) continue
      if (["company_nationality_id", "partnership_type_id"].includes(key)) parsed[key] = Number(val)
      else parsed[key] = val
    }
    setFilterValues({ page: 1, per_page: perPage, ...parsed })
    setPage(1)
    fetchFacilities({ ...parsed, search: searchQuery, sortColumn, sortOrder, page: 1, per_page: perPage })
  }

  const handleResetFilter = () => {
    setFilterValues({})
    setPage(1)
    fetchFacilities({ search: searchQuery, sortColumn, sortOrder, page: 1, per_page: perPage })
  }

  const handleApplyDefaultFilter = (parsed: Record<string, any>) => {
    setFilterValues({ page: 1, per_page: perPage, ...parsed })
    fetchFacilities({ ...parsed, search: searchQuery, sortColumn, sortOrder, page: 1, per_page: perPage })
  }

  const selectOptions = (entities: { id: number; name: any }[]) => [
    { value: "", label: t("common.all", "shared") || "All" },
    ...entities.map((e) => ({ value: String(e.id), label: getLocalizedName(e.name) })),
  ]

  const filterFields: FilterField[] = [
    { name: "email", label: t("facilities.email", "investments") || "Email", type: "text" },
    {
      name: "company_type",
      label: t("facilities.company_type", "investments") || "Company Type",
      type: "select",
      options: [
        { value: "", label: t("common.all", "shared") || "All" },
        { value: "commercial_register", label: t("facilities.commercial_register", "investments") || "Commercial Register" },
        { value: "national_id", label: t("facilities.national_id", "investments") || "National ID" },
      ],
    },
    {
      name: "company_nationality_id",
      label: t("facilities.company_nationality", "investments") || "Nationality",
      type: "select",
      options: selectOptions(countries),
    },
    {
      name: "partnership_type_id",
      label: t("facilities.partnership_type", "investments") || "Partnership Type",
      type: "select",
      options: selectOptions(partnershipTypes),
    },
    { name: "number_or_patrols", label: t("facilities.number_or_patrols", "investments") || "Patrols", type: "text" },
    { name: "from_created_at", label: t("facilities.from_created_at", "investments") || "From Created", type: "date" },
    { name: "to_created_at", label: t("facilities.to_created_at", "investments") || "To Created", type: "date" },
  ]

  const columns: ColumnDef<Facility>[] = [
    { key: "name", label: t("facilities.name", "investments") || "Name", width: 200, sortable: true },
    { key: "address", label: t("facilities.address", "investments") || "Address", width: 250 },
    { key: "created_at", label: t("facilities.created_at", "investments") || "Created At", width: 160, sortable: true, render: (row: Facility) => row.created_at || "—" },
  ]

  return (
    <SelectFromTable
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("facilities.picker_title", "investments") || "Select Facility"}
      multiple={multiple}
      initialSelected={initialSelected}
      defaultFilter={defaultFilter}
      onApplyDefaultFilter={handleApplyDefaultFilter}
      data={facilities}
      columns={columns}
      rowKey="id"
      isLoading={loadingMap["getAll"]}
      error={errorMap["getAll"]}
      onRetry={() => fetchFacilities({ ...filterValues, search: searchQuery, page, per_page: perPage })}
      onSearch={handleSearch}
      searchPlaceholder={t("common.search", "shared") || "Search..."}
      searchInitialValue={searchQuery}
      filterFields={filterFields}
      filterValues={filterValues}
      onApplyFilter={handleApplyFilter}
      onResetFilter={handleResetFilter}
      sortColumn={sortColumn}
      sortOrder={sortOrder}
      onSort={handleSort}
      page={page}
      perPage={perPage}
      totalPages={pagination?.lastPage || 1}
      totalItems={pagination?.total || 0}
      onPageChange={handlePageChange}
      onPerPageChange={handlePerPageChange}
      emptyMessage={t("facilities.no_records", "investments") || "No facilities found"}
    />
  )
}