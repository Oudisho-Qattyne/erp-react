import { useState, useEffect } from "react"
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

export function PlotPickerDialog({
  isOpen,
  onClose,
  onConfirm,
  multiple = false,
  initialSelected = [],
  defaultFilter,
}: PlotPickerDialogProps) {
  const { t } = useLanguage()
  const { entities: plots, getAll, loadingMap, errorMap, pagination } = useEntityCrud<Plot>('/investments/plots', '/investments/plots')
  const { entities: areas, getAll: getAreas } = useEntityCrud<EntityWithNameOnly>('/investments/plot-areas', '/investments/plot-areas')
  const { entities: classifications, getAll: getClassifications } = useEntityCrud<EntityWithNameOnly>('/investments/plot-classifications', '/investments/plot-classifications')

  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const [filterValues, setFilterValues] = useState<Record<string, any>>({})

  useEffect(() => {
    getAreas()
    getClassifications()
  }, [])

  const fetchPlots = (params: Record<string, any> = {}) => {
    const sp = new URLSearchParams()
    if (params.search) sp.append("search", params.search)
    if (params.page) sp.append("page", String(params.page))
    if (params.per_page) sp.append("per_page", String(params.per_page))
    Object.entries(params).forEach(([k, v]) => {
      if (!["search", "page", "per_page"].includes(k) && v !== "" && v !== undefined) {
        sp.append(k, String(v))
      }
    })
    getAll(`/investments/plots?${sp.toString()}`)
  }

  useEffect(() => {
    if (isOpen) {
      fetchPlots({ page: 1, per_page: perPage })
    }
  }, [isOpen])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(1)
    fetchPlots({ ...filterValues, search: query, page: 1, per_page: perPage })
  }

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = {}
    for (const [key, val] of Object.entries(values)) {
      if (val === "" || val === undefined) continue
      if (val === "true") parsed[key] = true
      else if (val === "false") parsed[key] = false
      else parsed[key] = val
    }
    setFilterValues({ page: 1, per_page: perPage, ...parsed })
    setPage(1)
    fetchPlots({ ...parsed, search: searchQuery, page: 1, per_page: perPage })
  }

  const handleResetFilter = () => {
    setFilterValues({})
    setPage(1)
    fetchPlots({ search: searchQuery, page: 1, per_page: perPage })
  }

  const handleApplyDefaultFilter = (parsed: Record<string, any>) => {
    setFilterValues({ page: 1, per_page: perPage, ...parsed })
    fetchPlots({ ...parsed, search: searchQuery, page: 1, per_page: perPage })
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchPlots({ ...filterValues, search: searchQuery, page: newPage, per_page: perPage })
  }

  const handlePerPageChange = (size: number) => {
    setPerPage(size)
    setPage(1)
    fetchPlots({ ...filterValues, search: searchQuery, page: 1, per_page: size })
  }

  const statusOptions = [
    { value: "unsold", label: t("plot_status.unsold", "investments") || "Unsold" },
    { value: "announced", label: t("plot_status.announced", "investments") || "Announced" },
    { value: "subscribed", label: t("plot_status.subscribed", "investments") || "Subscribed" },
    { value: "allocated", label: t("plot_status.allocated", "investments") || "Allocated" },
    { value: "separated", label: t("plot_status.separated", "investments") || "Separated" },
  ]

  const filterFields: FilterField[] = [
    { name: "status", label: t("plots.status", "investments") || "Status", type: "select", options: statusOptions },
    { name: "plot_area_id", label: t("plots.plot_area_id", "investments") || "Region", type: "select", options: areas.map(a => ({ value: String(a.id), label: getLocalizedName(a.name) })) },
    { name: "plot_classification_id", label: t("plots.plot_classification_id", "investments") || "Classification", type: "select", options: classifications.map(c => ({ value: String(c.id), label: getLocalizedName(c.name) })) },
    { name: "code", label: t("plots.code", "investments") || "Plot Code", type: "text" },
    { name: "identifier", label: t("plots.identifier", "investments") || "Plot Identifier", type: "text" },
    { name: "has_allocated_dossier", label: t("plots.filter_has_allocated_dossier", "investments") || "Has Allocated Dossier", type: "checkbox" },
    { name: "from_date", label: t("plots.from_date", "investments") || "From Date", type: "date" },
    { name: "to_date", label: t("plots.to_date", "investments") || "To Date", type: "date" },
  ]

  const columns: ColumnDef<Plot>[] = [
    { key: "code", label: t("plots.code", "investments") || "Code", width: 120 },
    { key: "identifier", label: t("plots.identifier", "investments") || "Identifier", width: 120 },
    { key: "area", label: t("plots.area", "investments") || "Area", width: 100 },
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
      onRetry={() => fetchPlots({ ...filterValues, search: searchQuery, page, per_page: perPage })}
      onSearch={handleSearch}
      searchPlaceholder={t("common.search", "shared") || "Search..."}
      searchInitialValue={searchQuery}
      filterFields={filterFields}
      filterValues={filterValues}
      onApplyFilter={handleApplyFilter}
      onResetFilter={handleResetFilter}
      page={page}
      perPage={perPage}
      totalPages={pagination?.lastPage || 1}
      totalItems={pagination?.total || 0}
      onPageChange={handlePageChange}
      onPerPageChange={handlePerPageChange}
      emptyMessage={t("plots.no_records", "investments") || "No plots found"}
    />
  )
}
