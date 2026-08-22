import { useEffect, useMemo, useState } from "react"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { Button } from "../../../../core/presentation/layouts/ui/buttons/Button"
import { DataTable, type ColumnDef } from "../../../../core/presentation/layouts/ui/tables/ResizableTable"
import { ErrorState } from "../../../../core/presentation/layouts/ui/state/ErrorState"
import { FilterDialog, type FilterField } from "../../../../core/presentation/layouts/ui/filter/FilterDialog"
import { ConfirmDialog } from "../../../../core/presentation/layouts/ui/dialog/ConfirmDialog"
import Input from "../../../../core/presentation/layouts/ui/inputs/Input"
import { inputBaseClasses } from "../../../../core/presentation/layouts/ui/inputs/styles"
import { useCurrencies } from "../hooks/useCurrencies"
import { CreateCurrencyForm } from "../components/CreateCurrencyForm"
import { UpdateCurrencyForm } from "../components/UpdateCurrencyForm"
import type { Currency } from "../../domain/entities/Currency"
import type { CurrencyFilters } from "../../application/dtos/currencyDtos"
import { Dialog } from "../../../../core/presentation/layouts/ui/dialog/Dialog"
import { Search, Filter, Trash2, Plus, Pencil, Check, X } from "lucide-react"

const MODULE = "finance"

const getCurrencyName = (currency: Pick<Currency, "name">): string =>
  typeof currency.name === "string" ? currency.name : currency.name?.ar || currency.name?.en || ""

export function CurrenciesPage() {
  const { t } = useLanguage()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editCurrency, setEditCurrency] = useState<Currency | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Currency | null>(null)
  const [localSearch, setLocalSearch] = useState("")

  const {
    currencies,
    loading,
    error,
    pagination,
    filter,
    setFilter,
    resetFilter,
    findAllCurrencies,
    deleteCurrency,
  } = useCurrencies()

  const handleSearch = () => {
    setFilter({ search: localSearch, page: 1 })
  }

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return
    try {
      await deleteCurrency({ code: confirmDelete.code })
      setConfirmDelete(null)
      findAllCurrencies()
    } catch {
      setConfirmDelete(null)
    }
  }

  const sortColumn = filter.sort_by ? (Object.keys(filter.sort_by)[0] as string) : undefined
  const sortOrder = sortColumn ? filter.sort_by?.[sortColumn as keyof CurrencyFilters["sort_by"]] : undefined

  const handleSort = (key: string) => {
    const order = sortColumn === key && sortOrder === "asc" ? "desc" : "asc"
    setFilter({ sort_by: { [key]: order } as CurrencyFilters["sort_by"], page: 1 })
  }

  useEffect(() => {
    findAllCurrencies()
  }, [filter])

  const columns: ColumnDef<Currency>[] = [
    {
      key: "name",
      label: t("currency.name", MODULE) || "Name",
      width: 200,
      sortable: true,
      render: (row) => getCurrencyName(row),
    },
    { key: "code", label: t("currency.code", MODULE) || "Code", width: 120, sortable: true },
    { key: "symbol", label: t("currency.symbol", MODULE) || "Symbol", width: 100 },
    { key: "decimal_places", label: t("currency.decimal_places", MODULE) || "Decimal Places", width: 140, sortable: true },
    {
      key: "created_at",
      label: t("currency.created_at", MODULE) || "Created At",
      width: 160,
      sortable: true,
      render: (row) => row.created_at,
    },
    {
      key: "is_base",
      label: t("currency.is_base", MODULE) || "Base",
      width: 100,
      render: (row: Currency) => row.is_base
        ? <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full"><Check size={12} /> {t('common.yes', 'shared') || 'Yes'}</span>
        : <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><X size={12} /> {t('common.no', 'shared') || 'No'}</span>
    },
    {
      key: "actions",
      label: "",
      width: 100,
      align: "center",
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditCurrency(row)}
            title={t("currencies.edit", MODULE) || "Edit"}
            requiredPermission="financial.currencies.update"
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmDelete(row)}
            title={t("currency.delete", MODULE) || "Delete"}
            requiredPermission="financial.currencies.delete"
          >
            <Trash2 size={16} className="text-danger" />
          </Button>
        </div>
      ),
    },
  ]

  const filterFields: FilterField[] = [
    { name: "search", type: "text", label: t("currency.name", MODULE) || "Name" },
    { name: "code", type: "text", label: t("currency.code", MODULE) || "Code" },
    {
      name: "is_active",
      type: "select",
      label: t("common.is_active", "shared") || "Active",
      options: [
        { value: "", label: t("common.all", "shared") || "All" },
        { value: "true", label: t("currency.status_active", MODULE) || "Active" },
        { value: "false", label: t("currency.status_inactive", MODULE) || "Inactive" },
      ],
    },
  ]

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, unknown> = { page: 1, per_page: filter.per_page }
    for (const [key, val] of Object.entries(values)) {
      if (val !== "" && val !== undefined) parsed[key] = val
    }
    setFilter(parsed as Partial<CurrencyFilters>)
    setIsFilterOpen(false)
  }

  const filterInitialValues = useMemo(
    () => ({
      ...filter,
      is_active: filter.is_active === undefined ? "" : String(filter.is_active),
    }),
    [filter],
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("currencies.title", MODULE) || "Currencies"}</h1>
        <Button
          variant="primary"
          onClick={() => setIsAddOpen(true)}
          leftIcon={<Plus size={16} />}
          requiredPermission="financial.currencies.add"
        >
          {t("currencies.add", MODULE) || "Add Currency"}
        </Button>
      </div>

      {error.findAllCurrencies ? (
        <ErrorState message={error.findAllCurrencies} onRetry={() => findAllCurrencies()} />
      ) : (
        <div className="relative w-full">
          <div className="relative flex gap-3 py-3">
            <div className="relative flex-1 max-w-sm">
              <Input
                type="text"
                placeholder={t("currencies.search_placeholder", MODULE) || "Search by name..."}
                value={localSearch}
                onChange={(val) => setLocalSearch(val as string)}
                baseClasses={inputBaseClasses}
              />
            </div>
            <Button variant="primary" size="sm" onClick={handleSearch} leftIcon={<Search size={14} />}>
              {t("common.search", "shared") || "Search"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)} leftIcon={<Filter size={14} />}>
              {t("common.filter", "shared") || "Filter"}
            </Button>
            <Button variant="outline" size="sm" onClick={resetFilter}>
              {t("common.reset", "shared") || "Reset"}
            </Button>
          </div>

          <FilterDialog
            isOpen={isFilterOpen}
            fields={filterFields}
            initialValues={filterInitialValues}
            onFilter={handleApplyFilter}
            onCancel={() => setIsFilterOpen(false)}
            onReset={() => { resetFilter(); setIsFilterOpen(false) }}
          />

          <DataTable
            columns={columns}
            data={currencies}
            rowKey="code"
            onRowClick={() => {}}
            loading={loading.findAllCurrencies}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            onSort={handleSort}
            emptyMessage={t("currencies.no_data", MODULE) || "No currencies found"}
            pagination={{
              page: pagination.currentPage,
              totalPages: pagination.lastPage,
              totalItems: pagination.total,
              itemsPerPage: Number(filter.per_page) || 10,
              onPageChange: (page) => setFilter({ page }),
              onItemsPerPageChange: (size) => setFilter({ per_page: size, page: 1 }),
              itemsPerPageOptions: [10, 25, 50, 100],
            }}
          />
        </div>
      )}

      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={t("currencies.add_title", MODULE) || "Add New Currency"}
        size="md"
      >
        <CreateCurrencyForm
          onSuccess={() => { setIsAddOpen(false); findAllCurrencies() }}
          onCancel={() => setIsAddOpen(false)}
        />
      </Dialog>

      <Dialog
        isOpen={!!editCurrency}
        onClose={() => setEditCurrency(null)}
        title={t("currencies.edit_title", MODULE) || "Edit Currency"}
        size="md"
      >
        {editCurrency && (
          <UpdateCurrencyForm
            currency={editCurrency}
            onSuccess={() => { setEditCurrency(null); findAllCurrencies() }}
            onCancel={() => setEditCurrency(null)}
          />
        )}
      </Dialog>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title={t("currency.delete", MODULE) || "Delete"}
        message={t("currency.delete_confirm", MODULE) || "Are you sure you want to delete this currency?"}
        type="danger"
        confirmLabel={t("common.delete", "shared") || "Delete"}
        cancelLabel={t("common.cancel", "shared") || "Cancel"}
        confirmLoading={loading.deleteCurrency}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
