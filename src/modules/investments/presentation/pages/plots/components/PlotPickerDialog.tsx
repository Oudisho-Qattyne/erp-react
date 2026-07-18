import { useState, useEffect } from "react"
import { useEntityCrud } from "../../../../../../core/presentation/hooks/data/useEntity"
import { useLanguage } from "../../../../../../core/presentation/context/i18n/I18nProvider"
import { SelectFromTable } from "../../../../../../core/presentation/layouts/ui/picker/SelectFromTable"
import type { ColumnDef } from "../../../../../../core/presentation/layouts/ui/tables/ResizableTable"
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

  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string | undefined>(undefined)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const [filterValues, setFilterValues] = useState<Record<string, any>>({})

  useEffect(() => {
    if (isOpen) {
      fetchPlots({ page: 1, per_page: perPage })
    }
  }, [isOpen])

  const fetchPlots = (params: Record<string, any> = {}) => {
    const sp = new URLSearchParams()
    if (params.search) sp.append("search", params.search)
    if (params.sortColumn) { sp.append("sortColumn", params.sortColumn); sp.append("sortOrder", params.sortOrder) }
    if (params.page) sp.append("page", String(params.page))
    if (params.per_page) sp.append("per_page", String(params.per_page))
    Object.entries(params).forEach(([k, v]) => {
      if (!["search", "sortColumn", "sortOrder", "page", "per_page"].includes(k) && v !== "" && v !== undefined) {
        sp.append(k, String(v))
      }
    })
    getAll(`/investments/plots?${sp.toString()}`)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(1)
    fetchPlots({ ...filterValues, search: query, sortColumn: sortBy, sortOrder, page: 1, per_page: perPage })
  }

  const handleSort = (columnKey: string) => {
    const newOrder = sortBy === columnKey && sortOrder === "asc" ? "desc" : "asc"
    setSortBy(columnKey)
    setSortOrder(newOrder)
    setPage(1)
    fetchPlots({ ...filterValues, search: searchQuery, sortColumn: columnKey, sortOrder: newOrder, page: 1, per_page: perPage })
  }

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = { page: 1, per_page: perPage }
    Object.entries(values).forEach(([k, v]) => { if (v !== "" && v !== undefined) parsed[k] = v })
    setFilterValues(parsed)
    setPage(1)
    fetchPlots({ ...parsed, search: searchQuery, sortColumn: sortBy, sortOrder, page: 1, per_page: perPage })
  }

  const handleResetFilter = () => {
    setFilterValues({})
    setPage(1)
    fetchPlots({ search: searchQuery, sortColumn: sortBy, sortOrder, page: 1, per_page: perPage })
  }

  const handleApplyDefaultFilter = (parsed: Record<string, any>) => {
    setFilterValues(parsed)
    fetchPlots({ ...parsed, search: searchQuery, sortColumn: sortBy, sortOrder, page: 1, per_page: perPage })
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchPlots({ ...filterValues, search: searchQuery, sortColumn: sortBy, sortOrder, page: newPage, per_page: perPage })
  }

  const handlePerPageChange = (size: number) => {
    setPerPage(size)
    setPage(1)
    fetchPlots({ ...filterValues, search: searchQuery, sortColumn: sortBy, sortOrder, page: 1, per_page: size })
  }

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
      onRetry={() => fetchPlots({ ...filterValues, search: searchQuery, sortColumn: sortBy, sortOrder, page, per_page: perPage })}
      onSearch={handleSearch}
      searchPlaceholder={t("common.search", "shared") || "Search..."}
      searchInitialValue={searchQuery}
      filterFields={[]}
      filterValues={filterValues}
      onApplyFilter={handleApplyFilter}
      onResetFilter={handleResetFilter}
      sortColumn={sortBy}
      sortOrder={sortOrder}
      onSort={handleSort}
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
