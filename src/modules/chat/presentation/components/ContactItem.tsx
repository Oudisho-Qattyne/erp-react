import { formatTime, formatDate } from "../utils/formatDate"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import type { Conversation } from "../../domain/entities/Conversation"

interface ContactItemProps {
  conversation: Conversation
  isSelected: boolean
  onSelect: (conversation: Conversation) => void
  currentUserId: number
}

export function ContactItem({ conversation, isSelected, onSelect, currentUserId }: ContactItemProps) {
  const { language } = useLanguage()
  const locale = language === 'ar' ? 'ar-SA' : 'en-US'
  const otherUser =
    conversation.user_one_id === currentUserId
      ? conversation.user_two
      : conversation.user_one

  const lastMsg = conversation.last_message
  const lastMsgTime = lastMsg ? formatTime(lastMsg.created_at, locale) : ""
  const today = new Date()
  const lastMsgDate = lastMsg ? formatDate(lastMsg.created_at, locale) : ""
  const isToday = lastMsg && lastMsg.created_at.slice(0, 10) === today.toISOString().slice(0, 10)
  const displayTime = lastMsg ? (isToday ? lastMsgTime : lastMsgDate) : ""
  const unread = conversation.unread_messages_count ?? 0

  return (
    <button
      onClick={() => onSelect(conversation)}
      className={`group w-full text-right px-3 py-3 flex items-center gap-3 hover:bg-primary-light transition-colors border-b border-border/50 cursor-pointer ${
        isSelected ? "bg-primary" : ""
      }`}
    >
      <div className="relative shrink-0">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${
            isSelected ? "bg-primary-dark text-white" : "bg-primary/10 text-primary"
          }`}
        >
          {otherUser.name.charAt(0)}
        </div>
        {otherUser.status === "online" && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success border-2 border-card rounded-full" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <span className={`font-semibold text-sm truncate group-hover:text-white ${isSelected ? "text-white" : "text-text"}`}>
            {otherUser.name}
          </span>
          <span className={`text-[11px] shrink-0 mr-1 group-hover:text-white/70 ${isSelected ? "text-white/70" : "text-text-muted"}`}>
            {displayTime}
          </span>
        </div>
        <div className="flex justify-between items-center mt-0.5">
          {lastMsg ? (
            <span className={`text-xs truncate group-hover:text-white/70 ${isSelected ? "text-white/70" : "text-text-muted"}`}>
              {lastMsg.sender_id === currentUserId ? "You: " : ""}
              {lastMsg.body}
            </span>
          ) : (
            <span className={`text-xs group-hover:text-white/50 ${isSelected ? "text-white/50" : "text-text-muted"}`}>No messages yet</span>
          )}
          {unread > 0 && (
            <span className={`text-[10px] font-bold rounded-full min-w-4.5 h-4.5 flex items-center justify-center px-1 leading-none shrink-0 mr-1 ${
              isSelected ? "bg-white text-primary" : "bg-primary text-white"
            }`}>
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}