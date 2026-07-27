import { MessageBubble } from "./MessageBubble"
import type { Message } from "../../domain/entities/Message"

interface MessageListProps {
  messages: Message[]
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  currentUserId: number
}

export function MessageList({ messages, messagesEndRef, currentUserId }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-card">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} currentUserId={currentUserId} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
