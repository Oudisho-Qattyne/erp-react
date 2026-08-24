import { useEffect, useMemo } from "react"
import { useEntityCrud } from "../../../../../../core/presentation/hooks/data/useEntity"
import { useLanguage } from "../../../../../../core/presentation/context/i18n/I18nProvider"
import { SelectFromTable } from "../../../../../../core/presentation/layouts/ui/picker/SelectFromTable"
import type { ColumnDef } from "../../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import type { FilterField } from "../../../../../../core/presentation/layouts/ui/filter/FilterDialog"
import type { EntityWithNameOnly } from "../../../../../../core/domain/entities/EntityWithNameOnly"
import { getLocalizedName } from "../../../../../../core/presentation/utils/helpes"
import type { Plot } from "../../../../domain/entities/plot"

interface PlotPickerDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selected: Plot[]) => void
  multiple?: boolean
  initialSelected?: Plot[]
  defaultFilter?: Record<string, any>
}

const parseFilterValues = (values: Record<string, any>) => {
  const parsed: Record<string, any> = {}
  for (const [key, val] of Object.entries(values)) {
    if (val === "" || val === undefined) continue
    if (val === "true") parsed[key] = true
    else if (val === "false") parsed[key] = false
    else parsed[key] = val
  }
  return parsed
}

export function PlotPickerDialog({
  isOpen,
  onClose,
  onConfirm,
  multiple = false,
  initialSelected = [],
  defaultFilter,
}: PlotPickerDialogProps) {
  const { t } = useLanguage()
  const { entities: plots, loadingMap, errorMap, pagination, list } = useEntityCrud<Plot>(
    isOpen ? '/investments/plots' : '',
    '/investments/plots',
    { listState: true }
  )
  const { entities: areas, getAll: getAreas } = useEntityCrud<EntityWithNameOnly>('/investments/plot-areas', '/investments/plot-areas')
  const { entities: classifications, getAll: getClassifications } = useEntityCrud<EntityWithNameOnly>('/investments/plot-classifications', '/investments/plot-classifications')

  useEffect(() => {
    getAreas()
    getClassifications()
  }, [])

  const handleSearch = (query: string) => {
    list?.setSearch(query)
  }

  const handleApplyFilter = (values: Record<string, any>) => {
    list?.setFilter(parseFilterValues(values))
  }

  const handleResetFilter = () => {
    const search = list?.filter.search
    list?.resetFilter()
    if (search) list?.setSearch(search)
  }

  const handleApplyDefaultFilter = (parsed: Record<string, any>) => {
    list?.setFilter(parsed)
  }

  const SORT_FIELDS = ["code", "identifier", "area", "created_at"]
  const handleSort = (column: string) => {
    if (!SORT_FIELDS.includes(column)) return
    list?.setSort(column)
  }

  const filterInitialValues = useMemo(
    () => Object.fromEntries(Object.entries(list?.filter ?? {}).filter(([k]) => !['search', 'sortColumn', 'sortOrder'].includes(k))),
    [list?.filter]
  )

  const statusOptions = [
    { value: "unsold", label: t("plot_status.unsold", "investments") || "Unsold" },
    { value: "announced", label: t("plot_status.announced", "investments") || "Announced" },
    { value: "subscribed", label: t("plot_status.subscribed", "investments") || "Subscribed" },
    { value: "allocated", label: t("plot_status.allocated", "investments") || "Allocated" },
    { value: "separated", label: t("plot_status.separated", "investments") || "Separated" },
  ]

  const filterFields: FilterField[] = [
    { name: "status", label: t("plots.status", "investments") || "Status", type: "multi-select", options: statusOptions },
    { name: "plot_area_id", label: t("plots.plot_area_id", "investments") || "Region", type: "select", options: areas.map(a => ({ value: String(a.id), label: getLocalizedName(a.name) })) },
    { name: "plot_classification_id", label: t("plots.plot_classification_id", "investments") || "Classification", type: "select", options: classifications.map(c => ({ value: String(c.id), label: getLocalizedName(c.name) })) },
    { name: "code", label: t("plots.code", "investments") || "Plot Code", type: "text" },
    { name: "identifier", label: t("plots.identifier", "investments") || "Plot Identifier", type: "text" },
    { name: "has_allocated_dossier", label: t("plots.filter_has_allocated_dossier", "investments") || "Has Allocated Dossier", type: "checkbox" },
    { name: "from_date", label: t("plots.from_date", "investments") || "From Date", type: "date" },
    { name: "to_date", label: t("plots.to_date", "investments") || "To Date", type: "date" },
  ]

  const columns: ColumnDef<Plot>[] = [
    { key: "code", label: t("plots.code", "investments") || "Code", width: 120, sortable: true },
    { key: "identifier", label: t("plots.identifier", "investments") || "Identifier", width: 120, sortable: true },
    { key: "area", label: t("plots.area", "investments") || "Area", width: 100, sortable: true },
    { key: "plot_area_name", label: t("plots.plot_area_id", "investments") || "Plot Area", width: 120 },
    { key: "plot_classification_name", label: t("plots.plot_classification_id", "investments") || "Classification", width: 120 },
  ]

  return (
    <SelectFromTable
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("plots.picker_title", "investments") || "Select Plot"}
      multiple={multiple}
      initialSelected={initialSelected}
      defaultFilter={defaultFilter}
      onApplyDefaultFilter={handleApplyDefaultFilter}
      data={plots}
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
      emptyMessage={t("plots.no_records", "investments") || "No plots found"}
    />
  )
}
