import { useState } from "react"
import { Search, Loader2, AlertCircle } from "lucide-react"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { ContactItem } from "./ContactItem"
import type { Conversation } from "../../domain/entities/Conversation"

interface ContactListProps {
  conversations: Conversation[]
  selectedId: number | null
  onSelect: (conversation: Conversation) => void
  currentUserId: number
  loading: boolean
  error: string | null
  onRetry: () => void
}

export function ContactList({ conversations, selectedId, onSelect, currentUserId, loading, error, onRetry }: ContactListProps) {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = conversations.filter((c) => {
    const otherUser =
      c.user_one_id === currentUserId ? c.user_two : c.user_one
    return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-2">
        <Loader2 size={24} className="text-primary animate-spin" />
        <span className="text-sm text-text-muted">{t("contact_list.loading", "chat")}</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-3 p-4">
        <AlertCircle size={24} className="text-danger" />
        <span className="text-sm text-danger text-center">{error}</span>
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
        >
          {t("contact_list.retry", "chat")}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={t("contact_list.search_placeholder", "chat")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-2 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map((conv) => (
          <ContactItem
            key={conv.id}
            conversation={conv}
            isSelected={selectedId === conv.id}
            onSelect={onSelect}
            currentUserId={currentUserId}
          />
        ))}
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-32 text-sm text-text-muted">
            {t("contact_list.no_results", "chat")}
          </div>
        )}
      </div>
    </div>
  )
}
