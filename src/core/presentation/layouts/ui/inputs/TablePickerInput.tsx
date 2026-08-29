import React, { useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import { useLanguage } from "../../../context/i18n/I18nProvider"
import type { PickerComponent } from "../picker/pickerTypes"

interface TablePickerInputProps {
  value?: any
  onChange: (value: any) => void
  /** Picker dialog component fulfilling { isOpen, onClose, onConfirm } (e.g. PlotPickerDialog) */
  picker?: PickerComponent | null
  /** Extra props forwarded to the picker component (multiple, defaultFilter, ...) */
  pickerProps?: Record<string, any>
  /** Key of the selected row stored as the field value (default: "id") */
  valueKey?: string
  /** Key of the selected row shown in the input (default: "name") */
  labelKey?: string
  /** Static text or resolver overriding the automatic label */
  displayLabel?: string | ((value: any) => string)
  /** Called with the full selected rows when the user confirms or clears the picker */
  onSelectionChange?: (items: any[]) => void
  placeholder?: string
  disabled?: boolean
  baseClasses?: string
}

export function TablePickerInput({
  value,
  onChange,
  picker,
  pickerProps,
  valueKey = "id",
  labelKey = "name",
  displayLabel,
  onSelectionChange,
  placeholder,
  disabled,
  baseClasses,
}: TablePickerInputProps) {
  const { t, direction } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [pickedItems, setPickedItems] = useState<any[]>([])
  const isRTL = direction === "rtl"

  const currentValues = useMemo(
    () => (Array.isArray(value) ? value : value != null && value !== "" ? [value] : []),
    [value]
  )

  const display = useMemo(() => {
    if (typeof displayLabel === "function") return currentValues.length ? displayLabel(value) : ""
    if (currentValues.length === 0) return ""
    if (displayLabel) return displayLabel

    const matched = pickedItems.filter((item) => item != null && currentValues.includes(item[valueKey]))
    if (matched.length > 0) {
      return matched.map((it) => (it[labelKey] ?? "") as string).join(", ")
    }
    if (Array.isArray(value)) return `${value.length} ${t("common.selected", "shared") || "selected"}`
    return String(value)
  }, [displayLabel, currentValues, pickedItems, value, valueKey, labelKey, t])

  const canPick = !disabled && !!picker
  const hasValue = value != null && value !== "" && (!Array.isArray(value) || value.length > 0)

  const handleConfirm = (selected: any[]) => {
    setPickedItems(selected)
    const values = selected.map((s) => s?.[valueKey])
    onChange(pickerProps?.multiple ? values : values[0] ?? null)
    onSelectionChange?.(selected)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPickedItems([])
    onChange(Array.isArray(value) ? [] : null)
    onSelectionChange?.([])
  }

  const Picker = picker as PickerComponent | null | undefined

  return (
    <>
      <div className="relative w-full">
        <input
          type="text"
          readOnly
          value={display}
          placeholder={placeholder ?? (t("common.select", "shared") || "Select")}
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

      {isOpen && Picker && (
        <Picker
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={handleConfirm}
          {...pickerProps}
        />
      )}
    </>
  )
}
