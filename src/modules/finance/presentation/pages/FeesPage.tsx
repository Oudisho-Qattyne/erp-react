import { useEffect, useState } from "react"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { Button } from "../../../../core/presentation/layouts/ui/buttons/Button"
import { DataTable, type ColumnDef } from "../../../../core/presentation/layouts/ui/tables/ResizableTable"
import { ErrorState } from "../../../../core/presentation/layouts/ui/state/ErrorState"
import { FilterDialog, type FilterField } from "../../../../core/presentation/layouts/ui/filter/FilterDialog"
import { ActiveFilters } from "../../../../core/presentation/layouts/ui/filter/ActiveFilters"
import { ConfirmDialog } from "../../../../core/presentation/layouts/ui/dialog/ConfirmDialog"
import Input from "../../../../core/presentation/layouts/ui/inputs/Input"
import { inputBaseClasses } from "../../../../core/presentation/layouts/ui/inputs/styles"
import { useFees } from "../hooks/useFees"
import { CreateFeeForm } from "../components/CreateFeeForm"
import { UpdateFeeForm } from "../components/UpdateFeeForm"
import type { Fee } from "../../domain/entities/Fee"
import type { FeeFilters } from "../../application/dtos/feeDtos"
import { Dialog } from "../../../../core/presentation/layouts/ui/dialog/Dialog"
import { Search, Filter, Archive, RotateCcw, Plus, Pencil } from "lucide-react"

const MODULE = "finance"

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  archived: "bg-gray-100 text-gray-500 border-gray-200",
}

export function FeesPage() {
  const { t } = useLanguage()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editFee, setEditFee] = useState<Fee | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ fee: Fee; action: "archive" | "activate" } | null>(null)
  const [localSearch, setLocalSearch] = useState("")

  const {
    fees,
    loading,
    error,
    pagination,
    filter,
    setFilter,
    resetFilter,
    findAllFees,
    archiveFee,
    activeFee,
  } = useFees()

  const handleSearch = () => {
    setFilter({ search: localSearch, page: 1 })
  }

  const handleConfirm = async () => {
    if (!confirmAction) return
    try {
      const { id, name } = confirmAction.fee
      if (confirmAction.action === "archive") {
        await archiveFee({ id, name })
      } else {
        await activeFee({ id, name })
      }
      setConfirmAction(null)
      findAllFees()
    } catch {
      setConfirmAction(null)
    }
  }

  const sortColumn = filter.sort_by ? (Object.keys(filter.sort_by)[0] as string) : undefined
  const sortOrder = sortColumn ? filter.sort_by?.[sortColumn as keyof FeeFilters["sort_by"]] : undefined

  const handleSort = (key: string) => {
    const order = sortColumn === key && sortOrder === "asc" ? "desc" : "asc"
    setFilter({ sort_by: { [key]: order } as FeeFilters["sort_by"], page: 1 })
  }

  // useEffect(() => {
  //   findAllFees()
  // }, [filter])

  const columns: ColumnDef<Fee>[] = [
    { key: "id", label: "#", width: 60 },
    { key: "name", label: t("fee.name", MODULE) || "Name", width: 180, sortable: true },
    { key: "code", label: t("fee.code", MODULE) || "Code", width: 140, sortable: true },
    {
      key: "fee_value",
      label: t("fee.fee_value", MODULE) || "Fee Value",
      width: 120,
      sortable: true,
      render: (row) => row.fee_value,
    },
    {
      key: "fee_status",
      label: t("fee.fee_status", MODULE) || "Status",
      width: 110,
      render: (row) => (
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${statusStyles[row.fee_status] || ""}`}>
          {t(`fee.status_${row.fee_status}`, MODULE) || row.fee_status}
        </span>
      ),
    },
    {
      key: "created_at",
      label: t("fee.created_at", MODULE) || "Created At",
      width: 160,
      sortable: true,
      render: (row) => row.created_at,
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
            onClick={() => setEditFee(row)}
            title={t("fees.edit", MODULE) || "Edit"}
            requiredPermission="financial.payment-fees.update"
          >
            <Pencil size={16} />
          </Button>
          {row.fee_status === "archived" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmAction({ fee: row, action: "activate" })}
              title={t("fee.activate", MODULE) || "Activate"}
              requiredPermission="financial.payment-fees.update"
            >
              <RotateCcw size={16} />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmAction({ fee: row, action: "archive" })}
              title={t("fee.archive", MODULE) || "Archive"}
              requiredPermission="financial.payment-fees.update"
            >
              <Archive size={16} />
            </Button>
          )}
        </div>
      ),
    },
  ]

  const filterFields: FilterField[] = [
    { name: "search", type: "text", label: t("fee.name", MODULE) || "Name" },
    { name: "code", type: "text", label: t("fee.code", MODULE) || "Code" },
    {
      name: "status",
      type: "select",
      label: t("fee.fee_status", MODULE) || "Status",
      options: [
        { value: "", label: t("common.all", "shared") || "All" },
        { value: "active", label: t("fee.status_active", MODULE) || "Active" },
        { value: "archived", label: t("fee.status_archived", MODULE) || "Archived" },
      ],
    },
    {
      name: "value",
      type: "decimal",
      label: t("fee.value", MODULE) || "Value",
      decimalPlaces: 2,
    },
    {
      name: "value_from",
      type: "decimal",
      label: t("fee.value_from", MODULE) || "Min Value",
      decimalPlaces: 2,
    },
    {
      name: "value_to",
      type: "decimal",
      label: t("fee.value_to", MODULE) || "Max Value",
      decimalPlaces: 2,
    }
  ]

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, unknown> = { page: 1, per_page: filter.per_page }
    for (const [key, val] of Object.entries(values)) {
      if (val !== "" && val !== undefined) parsed[key] = val
    }
    setFilter(parsed as Partial<FeeFilters>)
    setIsFilterOpen(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("fees.title", MODULE) || "Fees"}</h1>
        <Button
          variant="primary"
          onClick={() => setIsAddOpen(true)}
          leftIcon={<Plus size={16} />}
          requiredPermission="financial.payment-fees.add"
        >
          {t("fees.add", MODULE) || "Add Fee"}
        </Button>
      </div>

      {error.findAllFees ? (
        <ErrorState message={error.findAllFees} onRetry={() => findAllFees()} />
      ) : (
        <div className="relative w-full">
          <div className="relative flex gap-3 py-3">
            <div className="relative flex-1 max-w-sm">
              <Input
                type="text"
                placeholder={t("fees.search_placeholder", MODULE) || "Search by name..."}
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
            data={fees}
            rowKey="id"
            onRowClick={() => {}}
            loading={loading.findAllFees}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            onSort={handleSort}
            emptyMessage={t("fees.no_data", MODULE) || "No fees found"}
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
        title={t("fees.add_title", MODULE) || "Add New Fee"}
        size="md"
      >
        <CreateFeeForm
          onSuccess={() => { setIsAddOpen(false); findAllFees() }}
          onCancel={() => setIsAddOpen(false)}
        />
      </Dialog>

      <Dialog
        isOpen={!!editFee}
        onClose={() => setEditFee(null)}
        title={t("fees.edit_title", MODULE) || "Edit Fee"}
        size="md"
      >
        {editFee && (
          <UpdateFeeForm
            fee={editFee}
            onSuccess={() => { setEditFee(null); findAllFees() }}
            onCancel={() => setEditFee(null)}
          />
        )}
      </Dialog>

      <ConfirmDialog
        isOpen={!!confirmAction}
        title={confirmAction?.action === "activate"
          ? t("fee.activate", MODULE) || "Activate"
          : t("fee.archive", MODULE) || "Archive"}
        message={confirmAction?.action === "activate"
          ? t("fee.activate_confirm", MODULE) || "Are you sure you want to activate this fee?"
          : t("fee.archive_confirm", MODULE) || "Are you sure you want to archive this fee?"}
        type={confirmAction?.action === "activate" ? "friendly" : "danger"}
        confirmLabel={confirmAction?.action === "activate"
          ? t("fee.activate", MODULE) || "Activate"
          : t("fee.archive", MODULE) || "Archive"}
        cancelLabel={t("common.cancel", "shared") || "Cancel"}
        confirmLoading={confirmAction?.action === "activate" ? loading.activeFee : loading.archiveFee}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  )
}
