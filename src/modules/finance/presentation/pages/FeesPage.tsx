import { useEffect, useState } from "react"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { Button } from "../../../../core/presentation/layouts/ui/buttons/Button"
import { DataTable, type ColumnDef } from "../../../../core/presentation/layouts/ui/tables/ResizableTable"
import { ErrorState } from "../../../../core/presentation/layouts/ui/state/ErrorState"
import { FilterDialog, type FilterField } from "../../../../core/presentation/layouts/ui/filter/FilterDialog"
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

  useEffect(() => {
    findAllFees()
  }, [filter])

  const columns: ColumnDef<Fee>[] = [
    { key: "id", label: "#", width: 60 },
    { key: "name", label: t("fee.name", MODULE) || "Name", width: 180 },
    { key: "code", label: t("fee.code", MODULE) || "Code", width: 140 },
    {
      key: "fee_value",
      label: t("fee.fee_value", MODULE) || "Fee Value",
      width: 120,
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
            requiredPermission="financial.payment-fee.update"
          >
            <Pencil size={16} />
          </Button>
          {row.fee_status === "archived" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => activeFee(row)}
              title={t("fee.activate", MODULE) || "Activate"}
              requiredPermission="financial.payment-fee.update"
            >
              <RotateCcw size={16} />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => archiveFee(row)}
              title={t("fee.archive", MODULE) || "Archive"}
              requiredPermission="financial.payment-fee.update"
            >
              <Archive size={16} />
            </Button>
          )}
        </div>
      ),
    },
  ]

  const filterFields: FilterField[] = [
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
  ]

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Partial<FeeFilters> = { page: 1, per_page: filter.per_page }
    for (const [key, val] of Object.entries(values)) {
      if (val !== "" && val !== undefined) parsed[key as keyof FeeFilters] = val as any
    }
    setFilter(parsed)
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
          requiredPermission="financial.payment-fee.add"
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
    </div>
  )
}
