import { useState, useRef, useEffect } from "react"
import { Clock } from "lucide-react"
import { useLanguage } from "../../../context/i18n/I18nProvider"
import { inputBaseClasses } from "./styles"

interface TimePickerProps {
  value?: string
  onChange: (time: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))

export function TimePicker({
  value,
  onChange,
  placeholder,
  disabled,
  required,
  className = "",
}: TimePickerProps) {
  const { direction } = useLanguage()
  const [inputValue, setInputValue] = useState(value || "")
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedHour, setSelectedHour] = useState(value ? value.split(":")[0] : "00")
  const [selectedMinute, setSelectedMinute] = useState(value ? value.split(":")[1] : "00")
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || "")
      if (value) {
        const [h, m] = value.split(":")
        setSelectedHour(h)
        setSelectedMinute(m)
      }
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (hour: string, minute: string) => {
    const time = `${hour}:${minute}`
    setSelectedHour(hour)
    setSelectedMinute(minute)
    setInputValue(time)
    onChange(time)
    setShowDropdown(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9:]/g, "").slice(0, 5)
    setInputValue(raw)

    if (raw.length === 5 && /^\d{2}:\d{2}$/.test(raw)) {
      const [h, m] = raw.split(":")
      if (Number(h) < 24 && Number(m) < 60) {
        onChange(raw)
      }
    }
  }

  const baseClasses = `${inputBaseClasses} ${className}`

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative group/date">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => !disabled && setShowDropdown(true)}
          placeholder={placeholder || "HH:mm"}
          disabled={disabled}
          required={required}
          className={`${baseClasses} ${disabled ? "" : direction === "rtl" ? "pr-8" : "pl-8"}`}
        />
        <Clock
          size={16}
          className={`absolute ${direction === "rtl" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-text-muted pointer-events-none`}
        />
      </div>
      {showDropdown && !disabled && (
        <div className="absolute z-50 mt-1 bg-card border border-border rounded-xl shadow-lg p-3 min-w-[200px]">
          <div className="flex gap-2 items-center">
            <div className="flex-1 max-h-[200px] overflow-y-auto space-y-1">
              {HOURS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleSelect(h, selectedMinute)}
                  className={`block w-full text-center px-2 py-1 rounded text-sm transition-colors ${
                    selectedHour === h ? "bg-primary text-white" : "hover:bg-muted text-text"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
            <span className="text-lg font-bold text-text">:</span>
            <div className="flex-1 max-h-[200px] overflow-y-auto space-y-1">
              {MINUTES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSelect(selectedHour, m)}
                  className={`block w-full text-center px-2 py-1 rounded text-sm transition-colors ${
                    selectedMinute === m ? "bg-primary text-white" : "hover:bg-muted text-text"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
