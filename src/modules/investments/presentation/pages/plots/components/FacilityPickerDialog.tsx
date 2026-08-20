import { useState, useEffect } from "react"
import { useEntityCrud } from "../../../../../../core/presentation/hooks/data/useEntity"
import { useLanguage } from "../../../../../../core/presentation/context/i18n/I18nProvider"
import { SelectFromTable } from "../../../../../../core/presentation/layouts/ui/picker/SelectFromTable"
import type { ColumnDef } from "../../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import type { Facility } from "../../../../domain/entities/facility"

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

  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const [filterValues, setFilterValues] = useState<Record<string, any>>({})

  const fetchFacilities = (params: Record<string, any> = {}) => {
    const sp = new URLSearchParams()
    if (params.search) sp.append("search", params.search)
    if (params.page) sp.append("page", String(params.page))
    if (params.per_page) sp.append("per_page", String(params.per_page))
    Object.entries(params).forEach(([k, v]) => {
      if (!["search", "page", "per_page"].includes(k) && v !== "" && v !== undefined) {
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
    fetchFacilities({ ...filterValues, search: query, page: 1, per_page: perPage })
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchFacilities({ ...filterValues, search: searchQuery, page: newPage, per_page: perPage })
  }

  const handlePerPageChange = (size: number) => {
    setPerPage(size)
    setPage(1)
    fetchFacilities({ ...filterValues, search: searchQuery, page: 1, per_page: size })
  }

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = {}
    for (const [key, val] of Object.entries(values)) {
      if (val === "" || val === undefined) continue
      parsed[key] = val
    }
    setFilterValues({ page: 1, per_page: perPage, ...parsed })
    setPage(1)
    fetchFacilities({ ...parsed, search: searchQuery, page: 1, per_page: perPage })
  }

  const handleResetFilter = () => {
    setFilterValues({})
    setPage(1)
    fetchFacilities({ search: searchQuery, page: 1, per_page: perPage })
  }

  const handleApplyDefaultFilter = (parsed: Record<string, any>) => {
    setFilterValues({ page: 1, per_page: perPage, ...parsed })
    fetchFacilities({ ...parsed, search: searchQuery, page: 1, per_page: perPage })
  }

  const columns: ColumnDef<Facility>[] = [
    { key: "name", label: t("facilities.name", "investments") || "Name", width: 200 },
    { key: "address", label: t("facilities.address", "investments") || "Address", width: 250 },
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
      filterFields={[]}
      filterValues={filterValues}
      onApplyFilter={handleApplyFilter}
      onResetFilter={handleResetFilter}
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