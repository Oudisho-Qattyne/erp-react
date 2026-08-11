import React, { lazy, Suspense, useContext, useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import { useLanguage } from "../../../context/i18n/I18nProvider"
import type { PickerConfig } from "../picker/pickerTypes"
import { AuthContext } from "../../../../infrastructure/auth/AuthProvider"

const SelectFromTable = lazy(() =>
  import("../picker/SelectFromTable").then((m) => ({ default: m.SelectFromTable })),
)

interface TablePickerInputProps {
  value?: any
  onChange: (value: any) => void
  pickerConfig?: PickerConfig | null
  placeholder?: string
  disabled?: boolean
  baseClasses?: string
}

export function TablePickerInput({
  value,
  onChange,
  pickerConfig,
  placeholder,
  disabled,
  baseClasses,
}: TablePickerInputProps) {
  const { t, direction } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const auth = useContext(AuthContext)
  const isRTL = direction === "rtl"

  const hasPermission = useMemo(() => {
    if (!pickerConfig?.requiredPermission) return true
    return auth?.hasPermission(pickerConfig.requiredPermission) ?? false
  }, [pickerConfig, auth])

  const valueProp = pickerConfig?.valueProp ?? "id"
  const labelProp = pickerConfig?.labelProp ?? "name"
  const data = pickerConfig?.data ?? []

  const selectedItems = useMemo(() => {
    const current = Array.isArray(value) ? value : value != null && value !== "" ? [value] : []
    return data.filter((item) => item != null && current.includes(item[valueProp]))
  }, [data, value, valueProp])

  const display = useMemo(() => {
    if (selectedItems.length > 0) {
      return selectedItems.map((it) => (it[labelProp] ?? "") as string).join(", ")
    }
    if (Array.isArray(value) && value.length > 0) return `${value.length} ${t("common.selected", "shared") || "selected"}`
    return value != null && value !== "" ? String(value) : ""
  }, [selectedItems, value, labelProp, t])

  const canPick = !disabled && hasPermission && !!pickerConfig
  const hasValue = value != null && value !== "" && (!Array.isArray(value) || value.length > 0)

  const handleConfirm = (selected: any[]) => {
    const values = selected.map((s) => s?.[valueProp])
    onChange(pickerConfig?.multiple ? values : values[0] ?? null)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(Array.isArray(value) ? [] : null)
  }

  return (
    <>
      <div className="relative w-full">
        <input
          type="text"
          readOnly
          value={display}
          placeholder={placeholder ?? (pickerConfig ? t("common.select", "shared") || "Select" : "")}
          disabled={!canPick}
          onClick={() => canPick && setIsOpen(true)}
          className={`${baseClasses} cursor-pointer ${canPick ? "bg-card/50" : "opacity-60 cursor-not-allowed"}`}
        />
        {canPick && hasValue && (
          <button
            type="button"
            onClick={handleClear}
            title={t("common.clear", "shared") || "Clear"}
            className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "left-9" : "right-9"} text-text-muted hover:text-danger transition-colors`}
          >
            <X size={14} />
          </button>
        )}
        <span
          className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "left-3" : "right-3"} text-text-muted pointer-events-none`}
        >
          <Search size={16} />
        </span>
      </div>

      {isOpen && pickerConfig && (
        <Suspense fallback={null}>
          <SelectFromTable
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onConfirm={handleConfirm}
            title={pickerConfig.dialogTitle || t("common.select", "shared") || "Select"}
            dialogSize={pickerConfig.dialogSize}
            multiple={pickerConfig.multiple}
            defaultFilter={pickerConfig.initialFilter}
            onApplyDefaultFilter={pickerConfig.onApplyInitialFilter ?? (() => {})}
            requiredPermission={pickerConfig.requiredPermission}
            data={data}
            columns={pickerConfig.columns}
            rowKey={pickerConfig.rowKey as any}
            isLoading={pickerConfig.isLoading ?? false}
            error={pickerConfig.error ?? null}
            onRetry={pickerConfig.onRetry}
            onSearch={pickerConfig.onSearch}
            searchPlaceholder={pickerConfig.searchPlaceholder}
            filterFields={pickerConfig.filterFields ?? []}
            filterValues={pickerConfig.filterValues ?? {}}
            onApplyFilter={pickerConfig.onApplyFilter ?? (() => {})}
            onResetFilter={pickerConfig.onResetFilter ?? (() => {})}
            sortColumn={pickerConfig.sortColumn}
            sortOrder={pickerConfig.sortOrder}
            onSort={pickerConfig.onSort}
            page={pickerConfig.page ?? 1}
            perPage={pickerConfig.perPage ?? 10}
            totalPages={pickerConfig.totalPages ?? 1}
            totalItems={pickerConfig.totalItems ?? 0}
            onPageChange={pickerConfig.onPageChange ?? (() => {})}
            onPerPageChange={pickerConfig.onPerPageChange ?? (() => {})}
            emptyMessage={pickerConfig.emptyMessage || t("common.no_data", "shared") || "No data"}
            createConfig={pickerConfig.createConfig}
          />
        </Suspense>
      )}
    </>
  )
}
