import { formatTime, formatDate } from "../utils/formatDate"
import { StatusIcon } from "./StatusIcon"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import type { Message } from "../../domain/entities/Message"

export function MessageBubble({ message, currentUserId }: { message: Message; currentUserId: number }) {
  const { language } = useLanguage()
  const locale = language === 'ar' ? 'ar-SA' : 'en-US'
  const isSentByMe = message.sender_id === currentUserId

  const time = formatTime(message.created_at, locale)
  const date = formatDate(message.created_at, locale)

  return (
    <div className={`flex ${isSentByMe ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[75%] min-w-0 px-3.5 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isSentByMe
            ? "bg-primary text-white rounded-tr-sm"
            : "bg-card text-text rounded-tl-sm"
        }`}
      >
        <div className="flex items-end gap-1.5 min-w-0">
          <span className="break-all whitespace-pre-wrap min-w-0">{message.body}</span>
          <span
            className={`text-[10px] shrink-0 flex items-center gap-0.5 ${
              isSentByMe ? "text-white/70" : "text-text-muted"
            }`}
          >
            {date} {time}
            {isSentByMe && <StatusIcon readAt={message.read_at} />}
          </span>
        </div>
      </div>
    </div>
  )
}
