import { useState, useEffect, useContext, useMemo } from "react"
import { Dialog } from "../dialog/Dialog"
import { Button } from "../buttons/Button"
import { DataTable, type ColumnDef } from "../tables/ResizableTable"
import { FilterDialog, type FilterField, type FilterLabelMaps } from "../filter/FilterDialog"
import { ActiveFilters } from "../filter/ActiveFilters"
import { createFilterFormatValue } from "../filter/filterLabels"
import Input from "../inputs/Input"
import { LoadingState } from "../state/LoadingState"
import { ErrorState } from "../state/ErrorState"
import { useLanguage } from "../../../context/i18n/I18nProvider"
import { GenericCreateForm, type FieldConfig, type GroupConfig } from "../forms/GenericCreateForm"
import type { ZodSchema } from "zod"
import { Filter, Search, Plus } from "lucide-react"
import { inputBaseClasses } from "../inputs/styles"
import { AuthContext } from "../../../../infrastructure/auth/AuthProvider"

export interface SelectFromTableProps<T extends { id: number | string }> {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selected: T[]) => void
  title: string
  dialogSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"
  multiple?: boolean
  initialSelected?: T[]
  defaultFilter?: Record<string, any>
  onApplyDefaultFilter: (filter: Record<string, any>) => void
  requiredPermission?: string | string[]

  data: T[]
  columns: ColumnDef<T>[]
  rowKey?: keyof T
  isLoading: boolean
  error: string | null
  onRetry?: () => void

  onSearch?: (query: string) => void
  searchPlaceholder?: string
  searchInitialValue?: string

  filterFields: FilterField[]
  filterValues: Record<string, any>
  onApplyFilter: (values: Record<string, any>) => void
  onResetFilter: () => void

  sortColumn?: string
  sortOrder?: "asc" | "desc"
  onSort?: (columnKey: string) => void

  page: number
  perPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void

  emptyMessage: string

  createConfig?: {
    schema: ZodSchema<any>
    fields?: FieldConfig[]
    groups?: GroupConfig[]
    defaultValues?: Record<string, any>
    onSubmit: (data: any) => Promise<any>
    onError?: (error: any) => void
    dialogTitle?: string
    dialogSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"
    buttonLabel?: string
    submitLabel?: string
    createButtonPermission?: string | string[]
  }
}

export function SelectFromTable<T extends { id: number | string }>({
  isOpen,
  onClose,
  onConfirm,
  title,
  multiple = false,
  initialSelected = [],
  defaultFilter,
  onApplyDefaultFilter,
  requiredPermission,
  dialogSize = "2xl",

  data,
  columns,
  rowKey = "id" as keyof T,
  isLoading,
  error,
  onRetry,

  onSearch,
  searchPlaceholder,
  searchInitialValue = "",

  filterFields,
  filterValues,
  onApplyFilter,
  onResetFilter,

  sortColumn,
  sortOrder,
  onSort,

  page,
  perPage,
  totalPages,
  totalItems,
  onPageChange,
  onPerPageChange,

  emptyMessage,
  createConfig,
}: SelectFromTableProps<T>) {
  const { t } = useLanguage()
  const auth = useContext(AuthContext)
  const hasPermission = useMemo(() => {
    if (!requiredPermission) return true
    return auth?.hasPermission(requiredPermission) ?? false
  }, [requiredPermission, auth])

  if (!hasPermission) return null
  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>(initialSelected.map((e) => e.id))
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchInitialValue)
  const [labelMaps, setLabelMaps] = useState<FilterLabelMaps>({})
  const formatValue = useMemo(() => createFilterFormatValue(labelMaps), [labelMaps])

  useEffect(() => {
    if (isOpen) {
      setSelectedKeys(initialSelected.map((e) => e.id))
      setLocalSearch(searchInitialValue)
      if (defaultFilter) {
        const parsed: Record<string, any> = {}
        for (const [key, val] of Object.entries(defaultFilter)) {
          if (val === "true") parsed[key] = true
          else if (val === "false") parsed[key] = false
          else parsed[key] = val
        }
        onApplyDefaultFilter(parsed)
      }
    }
  }, [isOpen, defaultFilter])

  const handleSearch = () => {
    if (onSearch) {
      return onSearch(localSearch)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  const handleConfirm = () => {
    const selected = data.filter((item) => selectedKeys.includes(item.id))
    onConfirm(selected)
    onClose()
  }

  const handleRowClick = (row: T) => {
    if (!multiple) {
      onConfirm([row])
      onClose()
      return
    }
    const key = row[rowKey] as string | number;
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const s = (key: string, fallback: string) => t(key, "shared") || fallback

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={dialogSize}
      actions={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" onClick={onClose}>
            {s("common.cancel", "Cancel")}
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={selectedKeys.length === 0}>
            {s("common.confirm", "Confirm")}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="relative flex justify-between items-center">
        <div className="flex items-center gap-2">
          {
            onSearch &&
            <div className="relative flex-1 max-w-sm">
              <Input
                type="text"
                placeholder={searchPlaceholder || s("common.search", "Search...")}
                value={localSearch}
                onChange={(val) => setLocalSearch(val as string)}
                baseClasses={inputBaseClasses}
              />
            </div>
          }
          {onSearch &&
            <Button variant="primary" size="sm" onClick={handleSearch} leftIcon={<Search size={14} />}>
              {s("common.search", "Search")}
            </Button>
          }
          {filterFields.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)} leftIcon={<Filter size={14} />}>
                {s("common.filter", "Filter")}
              </Button>
              <Button variant="outline" size="sm" onClick={onResetFilter}>
                {s("common.reset", "Reset")}
              </Button>
            </>
          )}
        </div>
          {createConfig && (
            <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus size={14} />} requiredPermission={createConfig.createButtonPermission}>
              {createConfig.buttonLabel || s("common.create", "Create")}
            </Button>
          )}
          </div>
        {filterFields.length > 0 && (
          <ActiveFilters filters={filterValues} fields={filterFields} className="mt-1" formatValue={formatValue} />
        )}
        {isLoading && <LoadingState message={t('common.loading', 'shared') || 'Loading...'} />}
        {error && !isLoading && (
          <ErrorState message={error} onRetry={onRetry || (() => { })} />
        )}
        {!isLoading && !error && (
          <DataTable
            columns={columns}
            data={data}
            rowKey={rowKey}
            selectable={multiple || undefined}
            selectedRows={multiple ? selectedKeys : undefined}
            onSelectionChange={multiple ? setSelectedKeys : undefined}
            onRowClick={handleRowClick}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            onSort={onSort}
            pagination={{
              page,
              totalPages,
              totalItems,
              onPageChange,
              itemsPerPage: perPage,
              onItemsPerPageChange: (size) => onPerPageChange(size),
              itemsPerPageOptions: [10, 25, 50, 100],
            }}
            emptyMessage={emptyMessage}
          />
        )}

        {multiple && selectedKeys.length > 0 && (
          <div className="text-sm text-text-muted">
            {selectedKeys.length} {s("common.selected", "selected")}
          </div>
        )}
      </div>

      <FilterDialog
        isOpen={isFilterOpen}
        fields={filterFields}
        initialValues={filterValues}
        onFilter={(values, maps) => { setLabelMaps(maps ?? {}); onApplyFilter(values); setIsFilterOpen(false) }}
        onCancel={() => setIsFilterOpen(false)}
        onReset={() => { setLabelMaps({}); onResetFilter(); setIsFilterOpen(false) }}
      />

      {createConfig && (
        <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={createConfig.dialogTitle || s("common.create", "Create")} size={createConfig.dialogSize}>
          <GenericCreateForm
            schema={createConfig.schema}
            fields={createConfig.fields}
            groups={createConfig.groups}
            defaultValues={createConfig.defaultValues}
            onSubmit={async (data) => {
              try {
                return await createConfig.onSubmit(data)
              } catch (error) {
                createConfig.onError?.(error)
                throw error
              }
            }}
            onSuccess={() => setIsCreateOpen(false)}
            onCancel={() => setIsCreateOpen(false)}
            submitLabel={createConfig.submitLabel || s("common.create", "Create")}
          />
        </Dialog>
      )}
    </Dialog>
  )
}
