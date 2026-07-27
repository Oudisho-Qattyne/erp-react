import { formatTime } from "../utils/formatDate"
import { StatusIcon } from "./StatusIcon"
import type { Message } from "../../domain/entities/Message"

export function MessageBubble({ message, currentUserId }: { message: Message; currentUserId: number }) {
  const isSentByMe = message.sender_id === currentUserId

  const time = formatTime(message.created_at)

  return (
    <div className={`flex ${isSentByMe ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isSentByMe
            ? "bg-primary text-white rounded-tr-sm"
            : "bg-card text-text rounded-tl-sm"
        }`}
      >
        <div className="flex items-end gap-1.5">
          <span>{message.body}</span>
          <span
            className={`text-[10px] shrink-0 flex items-center gap-0.5 ${
              isSentByMe ? "text-white/70" : "text-text-muted"
            }`}
          >
            {message.created_at}
            {isSentByMe && <StatusIcon readAt={message.read_at} />}
          </span>
        </div>
      </div>
    </div>
  )
}
