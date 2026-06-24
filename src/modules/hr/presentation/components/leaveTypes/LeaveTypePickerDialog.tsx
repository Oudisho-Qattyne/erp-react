import { useState, useEffect } from "react"
import { Dialog } from "../../../../../core/presentation/layouts/ui/dialog/Dialog"
import { Button } from "../../../../../core/presentation/layouts/ui/buttons/Button"
import { DataTable, type ColumnDef } from "../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import { FilterDialog, type FilterField } from "../../../../../core/presentation/layouts/ui/filter/FilterDialog"
import Input from "../../../../../core/presentation/layouts/ui/inputs/Input"
import { LoadingState } from "../../../../../core/presentation/layouts/ui/state/LoadingState"
import { ErrorState } from "../../../../../core/presentation/layouts/ui/state/ErrorState"
import { useLeaveTypes } from "../../hooks/leave/useLeaveTypes"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { Filter, Search } from "lucide-react"
import type { EntityWithNameOnly } from "../../../../../core/domain/entities/EntityWithNameOnly"

interface LeaveTypePickerDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (selected: EntityWithNameOnly[]) => void
    multiple?: boolean
    initialSelected?: EntityWithNameOnly[]
}

export function LeaveTypePickerDialog({
    isOpen,
    onClose,
    onConfirm,
    multiple = false,
    initialSelected = [],
}: LeaveTypePickerDialogProps) {
    const { t, language } = useLanguage()
    const { items: leaveTypes, loading, error, pagination, filter, setSearch, setPage, setFilter, resetFilter } = useLeaveTypes()

    const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>(initialSelected.map((e) => e.id))
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [localSearch, setLocalSearch] = useState(filter.search || "")

    useEffect(() => {
        if (isOpen) {
            setSelectedKeys(initialSelected.map((e) => e.id))
        }
    }, [isOpen, initialSelected])

    const filterFields: FilterField[] = []

    const handleApplyFilter = (values: Record<string, any>) => {
        setFilter(values as any)
        setIsFilterOpen(false)
    }

    const handleSearch = () => setSearch(localSearch)

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSearch()
    }

    const handleConfirm = () => {
        const selected = leaveTypes.filter((e) => selectedKeys.includes(e.id))
        onConfirm(selected)
        onClose()
    }

    const handleRowClick = (row: EntityWithNameOnly) => {
        if (!multiple) {
            onConfirm([row])
            onClose()
        }
    }

    const columns: ColumnDef<EntityWithNameOnly>[] = [
        {
            key: "name",
            label: t("leave_types.type_name", "hr") || "Leave Type",
            width: 300,
            render: (row) => (typeof row.name === "string" ? row.name : language === "ar" ? row.name.ar : row.name.en),
        },
    ]

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={t("leave_types.picker_title", "hr") || "Select Leave Types"}
            size="md"
            actions={
                <div className="flex items-center justify-end gap-3 w-full">
                    <Button variant="outline" onClick={onClose}>
                        {t("common.cancel", "shared") || "Cancel"}
                    </Button>
                    <Button variant="primary" onClick={handleConfirm} disabled={selectedKeys.length === 0}>
                        {t("common.confirm", "shared") || "Confirm"}
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Input
                            type="text"
                            placeholder={t("common.search", "shared") || "Search..."}
                            value={localSearch}
                            onChange={(val) => setLocalSearch(val as string)}
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

                {loading.findAll && <LoadingState />}
                {error.findAll && !loading.findAll && (
                    <ErrorState message={error.findAll} onRetry={() => { }} />
                )}
                {!loading.findAll && !error.findAll && (
                    <DataTable
                        columns={columns}
                        data={leaveTypes}
                        rowKey="id"
                        selectable={multiple || undefined}
                        selectedRows={multiple ? selectedKeys : undefined}
                        onSelectionChange={multiple ? setSelectedKeys : undefined}
                        onRowClick={handleRowClick}
                        pagination={{
                            page: pagination.currentPage,
                            totalPages: pagination.lastPage,
                            totalItems: pagination.total,
                            onPageChange: setPage,
                            itemsPerPage: filter.per_page,
                            onItemsPerPageChange: (size) => setFilter({ per_page: size, page: 1 }),
                            itemsPerPageOptions: [10, 25, 50, 100],
                        }}
                        emptyMessage={t("leave_types.no_data", "hr") || "No leave types found"}
                    />
                )}

                {multiple && selectedKeys.length > 0 && (
                    <div className="text-sm text-text-muted">
                        {selectedKeys.length} {t("leave_types.selected", "hr") || "selected"}
                    </div>
                )}
            </div>

            <FilterDialog
                isOpen={isFilterOpen}
                fields={filterFields}
                initialValues={filter}
                onFilter={handleApplyFilter}
                onCancel={() => setIsFilterOpen(false)}
                onReset={() => { resetFilter(); setIsFilterOpen(false) }}
            />
        </Dialog>
    )
}
