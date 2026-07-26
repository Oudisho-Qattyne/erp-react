import { useState } from "react"
import { Search, MessageCircle, Loader2, AlertCircle } from "lucide-react"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import type { ChatUser } from "../../domain/valueObjects/ChatUser"
import type { Conversation } from "../../domain/entities/Conversation"

interface UserListProps {
  users: ChatUser[]
  currentUserId: number
  existingConversations: Conversation[]
  onSelectUser: (user: ChatUser) => void
  onClose: () => void
  loading: boolean
  error: string | null
  onRetry: () => void
}

export function UserList({ users, currentUserId, existingConversations, onSelectUser, onClose, loading, error, onRetry }: UserListProps) {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-2">
        <Loader2 size={24} className="text-primary animate-spin" />
        <span className="text-sm text-text-muted">{t("user_list.loading", "chat")}</span>
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
          {t("user_list.retry", "chat")}
        </button>
      </div>
    )
  }

  const otherUsers = users.filter((u) => u.id !== currentUserId)
  const filtered = otherUsers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const hasExistingConversation = (userId: number) =>
    existingConversations.some(
      (c) => c.user_one_id === userId || c.user_two_id === userId,
    )

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={t("user_list.search_placeholder", "chat")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-2 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map((user) => {
          const existing = hasExistingConversation(user.id)
          return (
            <button
              key={user.id}
              onClick={() => onSelectUser(user)}
              className="w-full text-right px-3 py-3 flex items-center gap-3 hover:bg-primary-light transition-colors border-b border-border/50 cursor-pointer"
            >
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm bg-primary/10 text-primary">
                  {user.photo ? (
                    <img src={user.photo} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                {user.status === "online" && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success border-2 border-card rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-text truncate">
                  {user.name}
                </div>
                <div className="text-xs text-text-muted truncate">
                  {user.email}
                </div>
              </div>
              <div className="shrink-0">
                {existing ? (
                  <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {t("user_list.existing_conversation", "chat")}
                  </span>
                ) : (
                  <MessageCircle size={16} className="text-text-muted" />
                )}
              </div>
            </button>
          )
        })}
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-32 text-sm text-text-muted">
            {searchQuery ? t("user_list.no_results", "chat") : t("user_list.no_users", "chat")}
          </div>
        )}
      </div>
    </div>
  )
}
