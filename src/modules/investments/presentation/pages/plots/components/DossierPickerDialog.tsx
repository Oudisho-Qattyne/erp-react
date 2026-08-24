import { useMemo } from "react"
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

const parseFilterValues = (values: Record<string, any>) => {
  const parsed: Record<string, any> = {}
  for (const [key, val] of Object.entries(values)) {
    if (val === "" || val === undefined) continue
    parsed[key] = val
  }
  return parsed
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
  const { entities: dossiers, loadingMap, errorMap, pagination, list } = useEntityCrud<Dossier>(
    isOpen ? '/investments/dossiers' : '',
    '/investments/dossiers',
    { listState: true }
  )

  const handleSearch = (query: string) => {
    list?.setSearch(query)
  }

  const handleSort = (columnKey: string) => {
    list?.setSort(columnKey)
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
      emptyMessage={t("dossier.no_records", "investments") || "No dossiers found"}
    />
  )
}
