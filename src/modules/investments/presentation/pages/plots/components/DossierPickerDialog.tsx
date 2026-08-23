import { useState, useEffect } from "react"
import { useEntityCrud } from "../../../../../../core/presentation/hooks/data/useEntity"
import { useLanguage } from "../../../../../../core/presentation/context/i18n/I18nProvider"
import { SelectFromTable } from "../../../../../../core/presentation/layouts/ui/picker/SelectFromTable"
import type { ColumnDef } from "../../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import type { FilterField } from "../../../../../../core/presentation/layouts/ui/filter/FilterDialog"
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

  const fetchDossiers = (params: Record<string, any> = {}) => {
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
    getAll(`/investments/dossiers?${sp.toString()}`)
  }

  useEffect(() => {
    if (isOpen && !defaultFilter) {
      fetchDossiers({ page: 1, per_page: perPage })
    }
  }, [isOpen, defaultFilter])

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
    const parsed: Record<string, any> = {}
    for (const [key, val] of Object.entries(values)) {
      if (val === "" || val === undefined) continue
      parsed[key] = val
    }
    setFilterValues({ page: 1, per_page: perPage, ...parsed })
    setPage(1)
    fetchDossiers({ ...parsed, search: searchQuery, sortColumn: sortBy, sortOrder, page: 1, per_page: perPage })
  }

  const handleResetFilter = () => {
    setFilterValues({})
    setPage(1)
    fetchDossiers({ search: searchQuery, sortColumn: sortBy, sortOrder, page: 1, per_page: perPage })
  }

  const handleApplyDefaultFilter = (parsed: Record<string, any>) => {
    setFilterValues({ page: 1, per_page: perPage, ...parsed })
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

  const statusOptions = [
    { value: "draft", label: t("dossier.status_draft", "investments") || "Draft" },
    { value: "pending_subscription_fee", label: t("dossier.status_pending_subscription_fee", "investments") || "Pending Subscription Fee" },
    { value: "subscription_fee_paid", label: t("dossier.status_subscription_fee_paid", "investments") || "Subscription Fee Paid" },
    { value: "allocatable", label: t("dossier.status_allocatable", "investments") || "Allocatable" },
    { value: "active", label: t("dossier.status_active", "investments") || "Allocated" },
    { value: "subscription_approved", label: t("dossier.status_subscription_approved", "investments") || "Subscription Approved" },
    { value: "cancelled", label: t("dossier.status_cancelled", "investments") || "Cancelled" },
  ]

  const filterFields: FilterField[] = [
    { name: "dossier_number", label: t("dossier.number", "investments") || "Dossier Number", type: "text" },
    { name: "from_dossier_date", label: t("dossier.from_dossier_date", "investments") || "From Dossier Date", type: "date" },
    { name: "to_dossier_date", label: t("dossier.to_dossier_date", "investments") || "To Dossier Date", type: "date" },
    { name: "from_subscription_date", label: t("dossier.from_subscription_date", "investments") || "From Subscription Date", type: "date" },
    { name: "to_subscription_date", label: t("dossier.to_subscription_date", "investments") || "To Subscription Date", type: "date" },
    { name: "status", label: t("dossier.status", "investments") || "Status", type: "select", options: statusOptions },
  ]

  const columns: ColumnDef<Dossier>[] = [
    { key: "dossier_number", label: t("dossier.number", "investments") || "Dossier Number", width: 160, sortable: true },
    { key: "dossier_date", label: t("dossier.date", "investments") || "Date", width: 120, sortable: true },
    { key: "status", label: t("dossier.status", "investments") || "Status", width: 120 },
    { key: "created_at", label: t("dossier.created_at", "investments") || "Created At", width: 160, sortable: true, render: (row: Dossier) => row.created_at || "—" },
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
      filterFields={filterFields}
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
