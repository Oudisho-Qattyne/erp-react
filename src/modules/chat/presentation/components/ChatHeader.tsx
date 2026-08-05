import { ArrowLeft } from "lucide-react"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import type { Conversation } from "../../domain/entities/Conversation"

interface ChatHeaderProps {
  conversation: Conversation
  currentUserId: number
  onBack: () => void
}

export function ChatHeader({ conversation, currentUserId, onBack }: ChatHeaderProps) {
  const { t } = useLanguage()
  const otherUser =
    conversation.user_one_id === currentUserId
      ? conversation.user_two
      : conversation.user_one

  return (
    <div className="px-4 py-2.5 border-b border-border flex items-center gap-3 bg-background shrink-0">
      <button
        type="button"
        onClick={onBack}
        className="md:hidden p-1 hover:bg-primary-light rounded-md cursor-pointer"
      >
        <ArrowLeft size={18} />
      </button>
      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
        {otherUser.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm">{otherUser.name}</div>
        <div className="text-xs text-text-muted">
          {otherUser.status === "online" ? t("chat_header.online", "chat") : t("chat_header.offline", "chat")}
        </div>
      </div>
    </div>
  )
}
