import type { Conversation } from "../../domain/entities/Conversation"

interface ContactItemProps {
  conversation: Conversation
  isSelected: boolean
  onSelect: (conversation: Conversation) => void
  currentUserId: number
}

export function ContactItem({ conversation, isSelected, onSelect, currentUserId }: ContactItemProps) {
  const otherUser =
    conversation.user_one_id === currentUserId
      ? conversation.user_two
      : conversation.user_one

  const lastTime = new Date(conversation.created_at).toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <button
      onClick={() => onSelect(conversation)}
      className={`w-full text-right px-3 py-3 flex items-center gap-3 hover:bg-primary-light transition-colors border-b border-border/50 cursor-pointer ${
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
          <span className={`font-semibold text-sm truncate ${isSelected ? "text-white" : "text-text"}`}>
            {otherUser.name}
          </span>
          <span className={`text-xs shrink-0 mr-1 ${isSelected ? "text-white" : "text-text-muted"}`}>
            {lastTime}
          </span>
        </div>
      </div>
    </button>
  )
}
