import { useEffect, useMemo, useState } from "react"
import { useCurrencies } from "../hooks/useCurrencies"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { SelectFromTable } from "../../../../core/presentation/layouts/ui/picker/SelectFromTable"
import type { FieldConfig } from "../../../../core/presentation/layouts/ui/forms/GenericCreateForm"
import type { ColumnDef } from "../../../../core/presentation/layouts/ui/tables/ResizableTable"
import type { FilterField } from "../../../../core/presentation/layouts/ui/filter/FilterDialog"
import { getLocalizedName } from "../../../../core/presentation/utils/helpes"
import type { Currency } from "../../domain/entities/Currency"
import type { CurrencyFilters } from "../../application/dtos/currencyDtos"

type Translate = (key: string, module?: string) => string

type PickerCurrency = Currency & { id: number }

interface CurrencyPickerDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selected: Currency[]) => void
  multiple?: boolean
  initialSelected?: Currency[]
  defaultFilter?: Record<string, any>
  filterFields?: Partial<FilterField>[]
}

const SORT_FIELDS = ["name", "code", "created_at"]

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

export function CurrencyPickerDialog({
  isOpen,
  onClose,
  onConfirm,
  multiple = false,
  initialSelected = [],
  defaultFilter,
  filterFields: filterFieldsOverride,
}: CurrencyPickerDialogProps) {
  const { t } = useLanguage()
  const {
    currencies,
    loading,
    error,
    pagination,
    filter,
    setFilter,
    resetFilter,
    setPage,
    findAllCurrencies,
  } = useCurrencies()

  // Apply default filter + initial load when opened
  useEffect(() => {
    if (isOpen) {
      if (defaultFilter) setFilter(defaultFilter as any)
      else findAllCurrencies()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Refetch whenever the filter changes while open
  useEffect(() => {
    if (isOpen) findAllCurrencies()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const handleSearch = (query: string) => {
    setFilter({ search: query } as any)
  }

  const handleApplyFilter = (values: Record<string, any>) => {
    setFilter(parseFilterValues(values))
  }

  const handleResetFilter = () => {
    resetFilter()
  }

  const handleApplyDefaultFilter = (parsed: Record<string, any>) => {
    setFilter(parsed as any)
  }

  const handleSort = (column: string) => {
    if (!SORT_FIELDS.includes(column)) return
    const currentField = filter.sort_by ? Object.keys(filter.sort_by)[0] : undefined
    const currentOrder = currentField ? (filter.sort_by as any)[currentField] : undefined
    const order = currentField === column && currentOrder === "asc" ? "desc" : "asc"
    setFilter({ sort_by: { [column]: order } } as any)
  }

  const sortColumn = filter.sort_by ? Object.keys(filter.sort_by)[0] : ""
  const sortOrder = ((filter.sort_by as any)?.[sortColumn] as string) || "asc"

  const filterInitialValues = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(filter).filter(
          ([k]) => !["search", "sort_by", "page", "per_page"].includes(k),
        ),
      ),
    [filter],
  )

  const defaultFilterFields: FilterField[] = [
    {
      name: "is_active",
      label: t("currency.is_active", "finance") || "Active",
      type: "select",
      options: [
        { value: "", label: t("common.all", "shared") || "All" },
        { value: "true", label: t("common.yes", "shared") || "Yes" },
        { value: "false", label: t("common.no", "shared") || "No" },
      ],
    },
    { name: "code", label: t("currency.code", "finance") || "Code", type: "text" },
    { name: "name", label: t("currency.name", "finance") || "Name", type: "text" }
  ]

  const filterFields = useMemo(() => {
    if (!filterFieldsOverride || filterFieldsOverride.length === 0) return defaultFilterFields
    const overrideByName = new Map(filterFieldsOverride.map((f) => [f.name, f]))
    return defaultFilterFields.map((f) => {
      const override = overrideByName.get(f.name)
      return override ? ({ ...f, ...override } as FilterField) : f
    })
  }, [filterFieldsOverride, defaultFilterFields])

  const columns: ColumnDef<PickerCurrency>[] = [
    { key: "code", label: t("currency.code", "finance") || "Code", width: 120, sortable: true },
    {
      key: "name",
      label: t("currency.name", "finance") || "Name",
      width: 200,
      sortable: true,
      render: (row) => getLocalizedName(row.name),
    },
    { key: "symbol", label: t("currency.symbol", "finance") || "Symbol", width: 100 },
    {
      key: "is_base",
      label: t("currency.is_base", "finance") || "Base",
      width: 80,
      render: (row) => (row.is_base ? "✓" : ""),
    },
    {
      key: "is_active",
      label: t("common.is_active", "shared") || "Active",
      width: 80,
      render: (row) =>
        row.is_active ? t("common.yes", "shared") || "Yes" : t("common.no", "shared") || "No",
    },
  ]

  return (
    <SelectFromTable
      isOpen={isOpen}
      onClose={onClose}
      title={t("currency.picker_title", "finance") || "Select Currency"}
      multiple={multiple}
      defaultFilter={defaultFilter}
      onApplyDefaultFilter={handleApplyDefaultFilter}
      data={currencies as PickerCurrency[]}
      columns={columns}
      rowKey="code"
      isLoading={loading.findAllCurrencies}
      error={error.findAllCurrencies}
      onRetry={() => findAllCurrencies()}
      onSearch={handleSearch}
      searchPlaceholder={t("common.search", "shared") || "Search..."}
      searchInitialValue={filter.search ?? ""}
      filterFields={filterFields}
      filterValues={filterInitialValues}
      onApplyFilter={handleApplyFilter}
      onResetFilter={handleResetFilter}
      sortColumn={sortColumn}
      sortOrder={sortOrder as "asc" | "desc" | undefined}
      onSort={handleSort}
      page={pagination.currentPage}
      perPage={Number(filter.per_page) || 25}
      totalPages={pagination.lastPage}
      totalItems={pagination.total}
      onPageChange={(p: number) => setPage(p)}
      onPerPageChange={(size: number) => setFilter({ per_page: size } as any)}
      emptyMessage={t("currency.no_records", "finance") || "No currencies found"}
      initialSelected={initialSelected as PickerCurrency[]}
      onConfirm={(sel) => onConfirm(sel as Currency[])}
    />
  )
}

export const buildCurrencyPickerField = (
  name: string,
  label: string,
  t: Translate,
  currencies: Currency[],
  disabled = false,
  required = true,
): FieldConfig => ({
  name,
  label,
  required,
  type: "table-picker",
  group: "details",
  disabled,
  picker: CurrencyPickerDialog as FieldConfig["picker"],
  valueKey: "code",
  displayLabel: (code: any) => {
    const c = currencies.find((x) => x.code === code)
    if (!c) return code || ""
    return `${getLocalizedName(c.name)} (${c.code})`
  },
  pickerProps: {
    multiple: false,
  },
})
