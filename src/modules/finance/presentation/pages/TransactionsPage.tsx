import { useEffect, useState } from "react"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { Button } from "../../../../core/presentation/layouts/ui/buttons/Button"
import { DataTable, type ColumnDef } from "../../../../core/presentation/layouts/ui/tables/ResizableTable"
import { ErrorState } from "../../../../core/presentation/layouts/ui/state/ErrorState"
import { FilterDialog, type FilterField } from "../../../../core/presentation/layouts/ui/filter/FilterDialog"
import { ConfirmDialog } from "../../../../core/presentation/layouts/ui/dialog/ConfirmDialog"
import Input from "../../../../core/presentation/layouts/ui/inputs/Input"
import { inputBaseClasses } from "../../../../core/presentation/layouts/ui/inputs/styles"
import { useTransactions } from "../hooks/useTransactions"
import { CreateTransactionForm } from "../components/CreateTransactionForm"
import type { Transaction } from "../../domain/entities/Transaction"
import type { TransactionFilters } from "../../application/dtos/transactionDtos"
import { Dialog } from "../../../../core/presentation/layouts/ui/dialog/Dialog"
import { Search, Filter, Plus, Check, X } from "lucide-react"

const MODULE = "finance"

const typeStyles: Record<string, string> = {
  addition: "bg-success/10 text-success border-success/20",
  deduction: "bg-danger/10 text-danger border-danger/20",
  incoming: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  outgoing: "bg-orange-500/10 text-orange-600 border-orange-500/20",
}

const statusStyles: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  canceled: "bg-danger/10 text-danger border-danger/20",
}

const typeOptions = ["addition", "deduction", "incoming", "outgoing"]
const statusOptions = ["pending", "approved", "canceled"]

export function TransactionsPage() {
  const { t } = useLanguage()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ id: number; action: "approved" | "canceled" } | null>(null)
  const [localSearch, setLocalSearch] = useState("")

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
  } = useTransactions()

  const handleSearch = () => {
    setFilter({ search: localSearch, page: 1 })
  }

  useEffect(() => {
    findAllTransactions()
  }, [filter])

  const handleConfirm = async () => {
    if (!confirmAction) return
    try {
      await updateTransactionStatus(confirmAction.id, { status: confirmAction.action })
      setConfirmAction(null)
      findAllTransactions()
    } catch {
      setConfirmAction(null)
    }
  }

  const columns: ColumnDef<Transaction>[] = [
    { key: "id", label: "#", width: 60 },
    {
      key: "type",
      label: t("transaction.type", MODULE) || "Type",
      width: 130,
      render: (row) => (
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${typeStyles[row.type] || ""}`}>
          {t(`transaction.type_${row.type}`, MODULE) || row.type}
        </span>
      ),
    },
    {
      key: "status",
      label: t("transaction.status", MODULE) || "Status",
      width: 110,
      render: (row) => (
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${statusStyles[row.status] || ""}`}>
          {t(`transaction.status_${row.status}`, MODULE) || row.status}
        </span>
      ),
    },
    { key: "date", label: t("transaction.date", MODULE) || "Date", width: 130, render: (row) => row.date || "—" },
    {
      key: "value",
      label: t("transaction.value", MODULE) || "Value",
      width: 120,
      render: (row) => row.value.toFixed(2),
    },
    { key: "reason", label: t("transaction.reason", MODULE) || "Reason", width: 240, render: (row) => row.reason || "—" },
    {
      key: "actions",
      label: "",
      width: 100,
      align: "center",
      render: (row) =>
        row.status === "pending" ? (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmAction({ id: row.id, action: "approved" })}
              title={t("transaction.approve", MODULE) || "Approve"}
              // requiredPermission="financial.transaction.update"
            >
              <Check size={16} className="text-success" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmAction({ id: row.id, action: "canceled" })}
              title={t("transaction.cancel", MODULE) || "Cancel"}
              // requiredPermission="financial.transaction.update"
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
    { name: "date_from", type: "date", label: t("transaction.date_from", MODULE) || "Date From" },
    { name: "date_to", type: "date", label: t("transaction.date_to", MODULE) || "Date To" },
    {
      name: "value",
      type: "decimal",
      label: t("transaction.value", MODULE) || "Value",
      decimalPlaces: 2,
    },
  ]

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Partial<TransactionFilters> = { page: 1, per_page: filter.per_page }
    for (const [key, val] of Object.entries(values)) {
      if (val !== "" && val !== undefined) parsed[key as keyof TransactionFilters] = val as any
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
          // requiredPermission="financial.transaction.add"
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

      <ConfirmDialog
        isOpen={!!confirmAction}
        title={confirmAction?.action === "approved"
          ? t("transaction.approve", MODULE) || "Approve"
          : t("transaction.cancel", MODULE) || "Cancel"}
        message={confirmAction?.action === "approved"
          ? t("transaction.approve_confirm", MODULE) || "Are you sure you want to approve this transaction?"
          : t("transaction.cancel_confirm", MODULE) || "Are you sure you want to cancel this transaction?"}
        type={confirmAction?.action === "approved" ? "friendly" : "danger"}
        confirmLabel={confirmAction?.action === "approved"
          ? t("transaction.approve", MODULE) || "Approve"
          : t("transaction.cancel", MODULE) || "Cancel"}
        confirmLoading={loading.updateTransactionStatus}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  )
}
