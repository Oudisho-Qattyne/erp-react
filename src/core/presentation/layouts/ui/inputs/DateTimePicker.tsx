import { useState, useRef, useEffect } from "react"
import { CalendarIcon, Clock } from "lucide-react"
import { CustomCalendar } from "../calendar/Calendar"
import { useLanguage } from "../../../context/i18n/I18nProvider"
import { inputBaseClasses } from "./styles"

interface DateTimePickerProps {
  value?: string
  onChange: (datetime: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

export function DateTimePicker({
  value,
  onChange,
  placeholder,
  disabled,
  required,
  className = "",
}: DateTimePickerProps) {
  const { direction, language } = useLanguage()

  const parseValue = (val?: string) => {
    if (!val) return { date: "", time: "" }
    const [d, t] = val.split("T")
    return { date: d || "", time: t || "" }
  }

  const [dateValue, setDateValue] = useState(parseValue(value).date)
  const [timeValue, setTimeValue] = useState(parseValue(value).time)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const { date, time } = parseValue(value)
    if (date !== dateValue) setDateValue(date)
    if (time !== timeValue) setTimeValue(time)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowCalendar(false)
        setShowTimePicker(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const emitChange = (date: string, time: string) => {
    if (date && time) {
      onChange(`${date}T${time}`)
    } else {
      onChange("")
    }
  }

  const handleDateSelect = (date: string) => {
    setDateValue(date)
    setShowCalendar(false)
    if (timeValue) emitChange(date, timeValue)
  }

  const handleTimeSelect = (time: string) => {
    setTimeValue(time)
    setShowTimePicker(false)
    if (dateValue) emitChange(dateValue, time)
  }

  const baseClasses = `${inputBaseClasses} ${className}`

  const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
  const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            readOnly
            value={dateValue ? (() => { const [y, m, d] = dateValue.split("-"); return `${d}-${m}-${y}` })() : ""}
            onClick={() => !disabled && setShowCalendar(true)}
            placeholder={language === "ar" ? "DD-MM-YYYY" : "DD-MM-YYYY"}
            disabled={disabled}
            required={required}
            className={`${baseClasses} cursor-pointer ${disabled ? "" : direction === "rtl" ? "pr-8" : "pl-8"}`}
          />
          <CalendarIcon
            size={16}
            className={`absolute ${direction === "rtl" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-text-muted pointer-events-none`}
          />
          {showCalendar && !disabled && (
            <div className="absolute z-50 mt-1 left-1/2 -translate-x-1/2 min-w-[320px]">
              <CustomCalendar
                value={dateValue}
                onChange={handleDateSelect}
                onClose={() => setShowCalendar(false)}
              />
            </div>
          )}
        </div>

        <div className="relative w-[100px]">
          <input
            type="text"
            readOnly
            value={timeValue}
            onClick={() => !disabled && setShowTimePicker(true)}
            placeholder="HH:mm"
            disabled={disabled}
            required={required}
            className={`${baseClasses} cursor-pointer text-center ${disabled ? "" : "pl-8"}`}
          />
          <Clock
            size={16}
            className={`absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none`}
          />
          {showTimePicker && !disabled && (
            <div className="absolute z-50 mt-1 right-0 bg-card border border-border rounded-xl shadow-lg p-3 min-w-[180px]">
              <div className="flex gap-2 items-center">
                <div className="flex-1 max-h-[160px] overflow-y-auto space-y-1">
                  {HOURS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleTimeSelect(`${h}:${timeValue.split(":")[1] || "00"}`)}
                      className={`block w-full text-center px-2 py-1 rounded text-sm transition-colors ${
                        timeValue.startsWith(h) ? "bg-primary text-white" : "hover:bg-muted text-text"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
                <span className="text-lg font-bold text-text">:</span>
                <div className="flex-1 max-h-[160px] overflow-y-auto space-y-1">
                  {MINUTES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleTimeSelect(`${timeValue.split(":")[0] || "00"}:${m}`)}
                      className={`block w-full text-center px-2 py-1 rounded text-sm transition-colors ${
                        timeValue.endsWith(m) ? "bg-primary text-white" : "hover:bg-muted text-text"
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
      </div>
    </div>
  )
}
