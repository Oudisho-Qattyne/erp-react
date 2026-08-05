import { useState, useEffect } from "react"
import { useEntityCrud } from "../../../../../../core/presentation/hooks/data/useEntity"
import { useLanguage } from "../../../../../../core/presentation/context/i18n/I18nProvider"
import { SelectFromTable } from "../../../../../../core/presentation/layouts/ui/picker/SelectFromTable"
import type { ColumnDef } from "../../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import type { Dossier } from "../../../../domain/entities/dossier"

interface DossierPickerDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selected: Dossier[]) => void
  multiple?: boolean
  initialSelected?: Dossier[]
  defaultFilter?: Record<string, any>
}

export function DossierPickerDialog({
  isOpen,
  onClose,
  onConfirm,
  multiple = false,
  initialSelected = [],
  defaultFilter,
}: DossierPickerDialogProps) {
  const { t } = useLanguage()
  const { entities: dossiers, getAll, loadingMap, errorMap, pagination } = useEntityCrud<Dossier>('/investments/dossiers', '/investments/dossiers')

  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string | undefined>(undefined)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const [filterValues, setFilterValues] = useState<Record<string, any>>({})

  useEffect(() => {
    if (isOpen && !defaultFilter) {
      fetchDossiers({ page: 1, per_page: perPage })
    }
  }, [isOpen, defaultFilter])

  const fetchDossiers = (params: Record<string, any> = {}) => {
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
    getAll(`/investments/dossiers?${sp.toString()}`)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(1)
    fetchDossiers({ ...filterValues, search: query, sortColumn: sortBy, sortOrder, page: 1, per_page: perPage })
  }

  const handleSort = (columnKey: string) => {
    const newOrder = sortBy === columnKey && sortOrder === "asc" ? "desc" : "asc"
    setSortBy(columnKey)
    setSortOrder(newOrder)
    setPage(1)
    fetchDossiers({ ...filterValues, search: searchQuery, sortColumn: columnKey, sortOrder: newOrder, page: 1, per_page: perPage })
  }

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = { page: 1, per_page: perPage }
    Object.entries(values).forEach(([k, v]) => { if (v !== "" && v !== undefined) parsed[k] = v })
    setFilterValues(parsed)
    setPage(1)
    fetchDossiers({ ...parsed, search: searchQuery, sortColumn: sortBy, sortOrder, page: 1, per_page: perPage })
  }

  const handleResetFilter = () => {
    setFilterValues({})
    setPage(1)
    fetchDossiers({ search: searchQuery, sortColumn: sortBy, sortOrder, page: 1, per_page: perPage })
  }

  const handleApplyDefaultFilter = (parsed: Record<string, any>) => {
    setFilterValues(parsed)
    fetchDossiers({ ...parsed, search: searchQuery, sortColumn: sortBy, sortOrder, page: 1, per_page: perPage })
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchDossiers({ ...filterValues, search: searchQuery, sortColumn: sortBy, sortOrder, page: newPage, per_page: perPage })
  }

  const handlePerPageChange = (size: number) => {
    setPerPage(size)
    setPage(1)
    fetchDossiers({ ...filterValues, search: searchQuery, sortColumn: sortBy, sortOrder, page: 1, per_page: size })
  }

  const columns: ColumnDef<Dossier>[] = [
    { key: "dossier_number", label: t("dossier.number", "investments") || "Dossier Number", width: 160, sortable: true },
    { key: "dossier_date", label: t("dossier.date", "investments") || "Date", width: 120, sortable: true },
    { key: "status", label: t("dossier.status", "investments") || "Status", width: 120 },
  ]

  return (
    <SelectFromTable
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("dossier.picker_title", "investments") || "Select Dossier"}
      multiple={multiple}
      initialSelected={initialSelected}
      defaultFilter={defaultFilter}
      onApplyDefaultFilter={handleApplyDefaultFilter}
      data={dossiers}
      columns={columns}
      rowKey="id"
      isLoading={loadingMap["getAll"]}
      error={errorMap["getAll"]}
      onRetry={() => fetchDossiers({ ...filterValues, search: searchQuery, sortColumn: sortBy, sortOrder, page, per_page: perPage })}
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
      emptyMessage={t("dossier.no_records", "investments") || "No dossiers found"}
    />
  )
}
