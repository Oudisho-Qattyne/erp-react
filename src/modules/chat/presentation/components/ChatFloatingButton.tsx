import { useState, useEffect, useRef } from "react"
import { MessageCircle, X } from "lucide-react"
import { useAuth } from "../../../../core/infrastructure/auth/AuthProvider"
import { useChat } from "../hooks/useChat"
import { Button } from "../../../../core/presentation/layouts/ui/buttons/Button"
import ChatDialog from "./ChatDialog"

export function ChatFloatingButton() {
  const { user } = useAuth()
  const currentUserId = user?.id as number | undefined
  const chat = useChat(currentUserId)
  const [open, setOpen] = useState(false)
  const [visibleNotification, setVisibleNotification] = useState<typeof chat.incomingMessage>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (chat.incomingMessage && !open) {
      setVisibleNotification(chat.incomingMessage)
      chat.clearIncomingMessage()
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setVisibleNotification(null), 4000)
    }
  }, [chat.incomingMessage])

  useEffect(() => {
    if (open) setVisibleNotification(null)
  }, [open])

  const totalUnread = chat.conversations.reduce(
    (sum, c) => sum + (c.unread_messages_count || 0),
    0,
  )

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50 flex flex-row items-end gap-2">
        {visibleNotification && (
          <div
            className="bg-card border border-border rounded-xl shadow-xl p-3 max-w-65 animate-zoom-in cursor-pointer"
        onClick={() => setOpen(true)}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-text truncate">{visibleNotification.sender_name}</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setVisibleNotification(null) }}
                className="p-0.5 rounded hover:bg-primary-light transition-colors cursor-pointer shrink-0"
              >
                <X size={12} className="text-text-muted" />
              </button>
            </div>
            <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{visibleNotification.body}</p>
          </div>
        )}
        <Button
          variant="primary"
          className="rounded-full w-14 h-14 shadow-lg flex items-center justify-center relative"
          onClick={() => setOpen(true)}
        >
          <MessageCircle />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-bold rounded-full min-w-4.5 h-4.5 flex items-center justify-center px-1 leading-none">
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </Button>
      </div>
      <ChatDialog
        isOpen={open}
        onClose={() => { setOpen(false); chat.clearMessages() }}
        currentUserId={currentUserId ?? 0}
        currentUser={user}
        {...chat}
      />
    </>
  )
}
