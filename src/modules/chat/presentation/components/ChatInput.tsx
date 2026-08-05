import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"

interface ChatInputProps {
  onSend: (text: string) => void
}

export function ChatInput({ onSend }: ChatInputProps) {
  const { t } = useLanguage()
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = "auto"
      el.style.height = `${el.scrollHeight}px`
    }
  }, [value])

  const handleSend = () => {
    if (!value.trim()) return
    onSend(value.trim())
    setValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="px-4 py-3 border-t border-border bg-background shrink-0">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          placeholder={t("chat_input.placeholder", "chat")}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          className="flex-1 px-4 py-2.5 rounded-2xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none max-h-32 overflow-y-hidden"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!value.trim()}
          className="p-2.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
