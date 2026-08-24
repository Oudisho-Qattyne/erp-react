import { useEffect, useMemo } from "react"
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

const parseFilterValues = (values: Record<string, any>) => {
  const parsed: Record<string, any> = {}
  for (const [key, val] of Object.entries(values)) {
    if (val === "" || val === undefined) continue
    if (["company_nationality_id", "partnership_type_id"].includes(key)) parsed[key] = Number(val)
    else parsed[key] = val
  }
  return parsed
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
  const { entities: facilities, loadingMap, errorMap, pagination, list } = useEntityCrud<Facility>(
    isOpen ? '/investments/facilities' : '',
    '/investments/facilities',
    { listState: true }
  )
  const { entities: partnershipTypes, getAll: getPartnershipTypes } = useEntityCrud<PartnershipType>('/investments/partnership-types', '/investments/partnership-types')
  const { entities: countries, getAll: loadCountries } = useEntityCrud<Country>('/shared-kernal/countries', '/shared-kernal/countries')

  useEffect(() => {
    if (!isOpen) return
    getPartnershipTypes('/investments/partnership-types?is_active=true')
    loadCountries('/shared-kernal/countries')
  }, [isOpen])

  const handleSearch = (query: string) => {
    list?.setSearch(query)
  }

  const handleSort = (column: string) => {
    if (column !== "name" && column !== "created_at") return
    list?.setSort(column)
  }

  const handleApplyFilter = (values: Record<string, any>) => {
    list?.setFilter(parseFilterValues(values))
  }

  const handleResetFilter = () => {
    const { search, sortColumn, sortOrder } = list?.filter ?? {}
    list?.resetFilter()
    if (search) list?.setSearch(search)
    if (sortColumn) list?.setFilter({ sortColumn, sortOrder })
  }

  const handleApplyDefaultFilter = (parsed: Record<string, any>) => {
    list?.setFilter(parsed)
  }

  const filterInitialValues = useMemo(
    () => Object.fromEntries(Object.entries(list?.filter ?? {}).filter(([k]) => !['search', 'sortColumn', 'sortOrder'].includes(k))),
    [list?.filter]
  )

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
      onRetry={() => list?.refresh()}
      onSearch={handleSearch}
      searchPlaceholder={t("common.search", "shared") || "Search..."}
      searchInitialValue={list?.filter.search ?? ""}
      filterFields={filterFields}
      filterValues={filterInitialValues as Record<string, any>}
      onApplyFilter={handleApplyFilter}
      onResetFilter={handleResetFilter}
      sortColumn={(list?.filter.sortColumn as any) ?? ""}
      sortOrder={list?.filter.sortOrder ?? "asc"}
      onSort={handleSort}
      page={list?.page ?? 1}
      perPage={list?.perPage ?? 25}
      totalPages={pagination?.lastPage || 1}
      totalItems={pagination?.total || 0}
      onPageChange={(p: number) => list?.setPage(p)}
      onPerPageChange={(size: number) => list?.setPerPage(size)}
      emptyMessage={t("facilities.no_records", "investments") || "No facilities found"}
    />
  )
}
