import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { Button } from "../../../../core/presentation/layouts/ui/buttons/Button"
import { DataTable, type ColumnDef } from "../../../../core/presentation/layouts/ui/tables/ResizableTable"
import { ErrorState } from "../../../../core/presentation/layouts/ui/state/ErrorState"
import { FilterDialog, type FilterField } from "../../../../core/presentation/layouts/ui/filter/FilterDialog"
import { ActiveFilters } from "../../../../core/presentation/layouts/ui/filter/ActiveFilters"
import { useCurrencies } from "../hooks/useCurrencies"
import Input from "../../../../core/presentation/layouts/ui/inputs/Input"
import { inputBaseClasses } from "../../../../core/presentation/layouts/ui/inputs/styles"
import { useTransactions } from "../hooks/useTransactions"
import { CreateTransactionForm } from "../components/CreateTransactionForm"
import type { Transaction } from "../../domain/entities/Transaction"
import type { TransactionFilters } from "../../application/dtos/transactionDtos"
import { Dialog } from "../../../../core/presentation/layouts/ui/dialog/Dialog"
import { TablePickerInput } from "../../../../core/presentation/layouts/ui/inputs/TablePickerInput"
import { CurrencyPickerDialog } from "../components/CurrencyPickerDialog"
import { getLocalizedName } from "../../../../core/presentation/utils/helpes"
import { useTransactionableDetails } from "../../../../core/registry/transactionable/TransactionableProvider"
import { Search, Filter, Plus, Check, X } from "lucide-react"

const MODULE = "finance"

interface TransactionsNavState {
  filter?: { id?: number }
}

const typeStyles: Record<string, string> = {
  incoming: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  outgoing: "bg-orange-500/10 text-orange-600 border-orange-500/20",
}

const statusStyles: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  canceled: "bg-danger/10 text-danger border-danger/20",
}

const typeOptions = ["incoming", "outgoing"]
const statusOptions = ["pending", "approved", "canceled"]

export function TransactionsPage() {
  const { t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [paymentTarget, setPaymentTarget] = useState<{ transaction: Transaction; action: "approved" | "canceled" } | null>(null)
  const [payCurrency, setPayCurrency] = useState("SYP")
  const [payAmount, setPayAmount] = useState<number>(0)

  const [initialId] = useState(
    () => (location.state as TransactionsNavState | null)?.filter?.id ?? null
  )
  const [localSearch, setLocalSearch] = useState<string>()
  const appliedStateRef = useRef<unknown>(location.state)

  const {
    transactions,
    loading,
    error,
    pagination,
    filter,
    setFilter,
    resetFilter,
    findAllTransactions,
    updateTransactionStatus,
  } = useTransactions(initialId ? { id: initialId, page: 1 } : undefined)

  const {
    currencies,
    findAllCurrencies,
    convertCurrency,
  } = useCurrencies()

  const transactionableDetails = useTransactionableDetails()

  const getLinkedTypeLabel = (type: string): string => {
    const name = type.split("\\").pop() || type
    const readable = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    return t(`transaction.linked_${name}`, MODULE) || readable
  }

  const renderLinkedEntity = (type: string | undefined, entity: Record<string, any> | undefined) => {
    if (!type) return "—"
    const config = transactionableDetails.getTransactionableRoute(type)
    if (!config || !entity) return <span>{entity?.id ?? "—"}</span>
    const label = getLinkedTypeLabel(type)
    return (
      <Button
        variant="ghost"
        size="sm"
        requiredPermission={config.permission}
        className="underline underline-offset-2 hover:text-primary px-0"
        onClick={(e) => {
          e.stopPropagation()
          window.open(config.resolve(entity), "_blank")
        }}
      >
        {label}
        {entity.id != null && <span className="text-text-muted"> #{entity.id}</span>}
      </Button>
    )
  }

  const handleSearch = () => {
    setFilter({ search: localSearch, page: 1 })
  }

  useEffect(() => {
    if (!initialId) return
    navigate(location.pathname, { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (location.state === appliedStateRef.current) return
    appliedStateRef.current = location.state
    const id = (location.state as TransactionsNavState | null)?.filter?.id
    if (!id) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilter({ id, page: 1 })
    navigate(location.pathname, { replace: true, state: null })
  }, [location.state, location.pathname, navigate, setFilter])

  // useEffect(() => {
  //   findAllTransactions()
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [filter])

  useEffect(() => {
    if (paymentTarget && currencies.length === 0) {
      findAllCurrencies()
    }
  }, [paymentTarget, currencies.length])

  // Reset the payment currency/amount whenever the action dialog opens
  useEffect(() => {
    if (!paymentTarget) return
    setPayCurrency("SYP")
    setPayAmount(paymentTarget.transaction.transaction_value)
  }, [paymentTarget])

  // Convert the base transaction value into the selected payment currency (from_base)
  useEffect(() => {
    if (!paymentTarget) return
    if (payCurrency === "SYP") {
      setPayAmount(paymentTarget.transaction.transaction_value)
      return
    }
    let active = true
    convertCurrency({
      action: "from_base",
      currency_code: payCurrency,
      amount: paymentTarget.transaction.transaction_value,
    }).then((res) => {
      if (active && res?.result != null) setPayAmount(res.result)
    })
    return () => {
      active = false
    }
  }, [payCurrency, paymentTarget])

  const sortColumn = filter.sort_by ? (Object.keys(filter.sort_by)[0] as string) : undefined
  const sortOrder = sortColumn ? filter.sort_by?.[sortColumn as keyof TransactionFilters["sort_by"]] : undefined

  const handleSort = (key: string) => {
    const field = key === "id" ? "created_at" : key
    const order = sortColumn === field && sortOrder === "asc" ? "desc" : "asc"
    setFilter({ sort_by: { [field]: order } as TransactionFilters["sort_by"], page: 1 })
  }

  const columns: ColumnDef<Transaction>[] = [
    { key: "id", label: "#", width: 60, sortable: true, render: (row) => row.id },
    {
      key: "transaction_type",
      label: t("transaction.type", MODULE) || "Type",
      width: 130,
      render: (row) => (
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${typeStyles[row.transaction_type] || ""}`}>
          {t(`transaction.type_${row.transaction_type}`, MODULE) || row.transaction_type}
        </span>
      ),
    },
    {
      key: "transaction_status",
      label: t("transaction.status", MODULE) || "Status",
      width: 110,
      render: (row) => (
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${statusStyles[row.transaction_status] || ""}`}>
          {t(`transaction.status_${row.transaction_status}`, MODULE) || row.transaction_status}
        </span>
      ),
    },
    {
      key: "transaction_date",
      label: t("transaction.date", MODULE) || "Date",
      width: 130,
      sortable: true,
      render: (row) => row.transaction_date || "—",
    },
    {
      key: "transaction_value",
      label: t("transaction.value", MODULE) || "Value",
      width: 120,
      sortable: true,
      render: (row) => row.transaction_value.toFixed(2) + " SYP",
    },
    { key: "reason", label: t("transaction.reason", MODULE) || "Reason", width: 240, render: (row) => row.reason || "—" },
    // {
    //   key: "transactionable_type",
    //   label: t("transaction.transactionable_type", MODULE) || "Transactionable Type",
    //   width: 150,
    //   render: (row) =>
    //     row.transactionable_type
    //       ? t(`transaction.transactionable_type_${row.transactionable_type}`, MODULE) || row.transactionable_type
    //       : "—",
    // },
    {
      key: "transactionable_id",
      label: t("transaction.transactionable_id", MODULE) || "Transactionable",
      width: 130,
      render: (row) => renderLinkedEntity(row.transactionable_type, row.transactionable),
    },
    {
      key: "sourceable",
      label: t("transaction.sourceable", MODULE) || "Source",
      width: 110,
      render: (row) => renderLinkedEntity(row.sourceable_type, row.sourceable),
    },
    {
      key: "actions",
      label: "",
      width: 100,
      align: "center",
      render: (row) =>
        row.transaction_status === "pending" ? (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPaymentTarget({ transaction: row, action: "approved" })}
              title={t("transaction.approve", MODULE) || "Approve"}
              requiredPermission="financial.transactions.change-status"
            >
              <Check size={16} className="text-success" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPaymentTarget({ transaction: row, action: "canceled" })}
              title={t("transaction.cancel", MODULE) || "Cancel"}
              requiredPermission="financial.transactions.change-status"
            >
              <X size={16} className="text-danger" />
            </Button>
          </div>
        ) : null,
    },
  ]

  const filterFields: FilterField[] = [
    {
      name: "type",
      type: "select",
      label: t("transaction.type", MODULE) || "Type",
      options: [
        { value: "", label: t("common.all", "shared") || "All" },
        ...typeOptions.map((opt) => ({
          value: opt,
          label: t(`transaction.type_${opt}`, MODULE) || opt,
        })),
      ],
    },
    {
      name: "status",
      type: "select",
      label: t("transaction.status", MODULE) || "Status",
      options: [
        { value: "", label: t("common.all", "shared") || "All" },
        ...statusOptions.map((opt) => ({
          value: opt,
          label: t(`transaction.status_${opt}`, MODULE) || opt,
        })),
      ],
    },
    { name: "from_date", type: "date", label: t("transaction.from_date", MODULE) || "From Date" },
    { name: "to_date", type: "date", label: t("transaction.to_date", MODULE) || "To Date" },
    {
      name: "value",
      type: "decimal",
      label: t("transaction.value", MODULE) || "Value",
      decimalPlaces: 2,
    },
    {
      name: "value_from",
      type: "decimal",
      label: t("transaction.value_from", MODULE) || "Min Value",
      decimalPlaces: 2,
    },
    {
      name: "value_to",
      type: "decimal",
      label: t("transaction.value_to", MODULE) || "Max Value",
      decimalPlaces: 2,
    },
  ]

  const handleApplyFilter = (values: Record<string, unknown>) => {
    const parsed: Partial<TransactionFilters> = { page: 1, per_page: filter.per_page }
    for (const [key, val] of Object.entries(values)) {
      if (val !== "" && val !== undefined && val !== null) parsed[key as keyof TransactionFilters] = val as never
    }
    setFilter(parsed)
    setIsFilterOpen(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("transactions.title", MODULE) || "Transactions"}</h1>
        <Button
          variant="primary"
          onClick={() => setIsAddOpen(true)}
          leftIcon={<Plus size={16} />}
          requiredPermission="financial.transactions.add"
        >
          {t("transactions.add", MODULE) || "Add Transaction"}
        </Button>
      </div>

      {error.findAllTransactions ? (
        <ErrorState message={error.findAllTransactions} onRetry={() => findAllTransactions()} />
      ) : (
        <div className="relative w-full">
          <div className="relative flex gap-3 py-3">
            <div className="relative flex-1 max-w-sm">
              <Input
                type="text"
                placeholder={t("transactions.search_placeholder", MODULE) || "Search by reason..."}
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

          <ActiveFilters filters={filter} fields={filterFields} className="mt-1" />

          <FilterDialog
            isOpen={isFilterOpen}
            fields={filterFields}
            initialValues={filter}
            onFilter={handleApplyFilter}
            onCancel={() => setIsFilterOpen(false)}
            onReset={() => { resetFilter(); setIsFilterOpen(false) }}
          />

          <DataTable
            columns={columns}
            data={transactions}
            rowKey="id"
            onRowClick={() => {}}
            loading={loading.findAllTransactions}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            onSort={handleSort}
            emptyMessage={t("transactions.no_data", MODULE) || "No transactions found"}
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
        title={t("transactions.add_title", MODULE) || "Add New Transaction"}
        size="md"
      >
        <CreateTransactionForm
          onSuccess={() => { setIsAddOpen(false); findAllTransactions() }}
          onCancel={() => setIsAddOpen(false)}
        />
      </Dialog>

      <Dialog
        isOpen={!!paymentTarget}
        onClose={() => setPaymentTarget(null)}
        title={paymentTarget?.action === "approved"
          ? t("transaction.approve", MODULE) || "اعتماد المعاملة"
          : t("transaction.cancel", MODULE) || "إلغاء المعاملة"}
        size="md"
      >
        {paymentTarget && (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-sm text-text-muted mb-1">{t("transaction.value", MODULE) || "Value"}</p>
              <p className="text-4xl font-bold leading-none">
                {paymentTarget.transaction.transaction_value.toLocaleString()}
                <span className="text-2xl ml-2 text-primary">SYP</span>
              </p>
              <p className="text-xs text-text-muted mt-1">
                {t("transaction.base_currency", MODULE) || "Base currency"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("transaction.payment_currency", MODULE) || "العملة المدفوعة"}
              </label>
              <TablePickerInput
                value={payCurrency}
                onChange={(val) => setPayCurrency(val as string)}
                picker={CurrencyPickerDialog}
                valueKey="code"
                displayLabel={(code) => {
                  const c = currencies.find((x) => x.code === code)
                  return c ? `${getLocalizedName(c.name)} (${c.code})` : code || ""
                }}
                pickerProps={{ multiple: false }}
                baseClasses={inputBaseClasses}
              />
            </div>

            <div className="rounded-lg bg-card/40 p-3">
              <p className="text-sm text-text-muted mb-1">
                {t("transaction.paid_amount", MODULE) || "Client Paid Amount"}
              </p>
              <p className="text-2xl font-semibold">
                {payAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                <span className="text-base ml-2 text-text-muted">{payCurrency}</span>
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPaymentTarget(null)}>
                {t("common.cancel", "shared") || "Cancel"}
              </Button>
              <Button
                variant="primary"
                isLoading={loading.updateTransactionStatus}
                onClick={async () => {
                  await updateTransactionStatus(paymentTarget.transaction.id, {
                    transaction_status: paymentTarget.action,
                    transaction_currency_id: payCurrency,
                    client_payed_amount: Number(payAmount),
                  })
                  setPaymentTarget(null)
                  findAllTransactions()
                }}
              >
                {paymentTarget.action === "canceled"
                  ? t("transaction.cancel_transaction", MODULE) || "إلغاء المناقلة"
                  : t("transaction.confirm_payment", MODULE) || "تأكيد الدفع"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
