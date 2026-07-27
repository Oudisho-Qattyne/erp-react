import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { useAuth } from "../../../../core/infrastructure/auth/AuthProvider"
import { useChat } from "../hooks/useChat"
import { Button } from "../../../../core/presentation/layouts/ui/buttons/Button"
import ChatDialog from "./ChatDialog"

export function ChatFloatingButton() {
  const { user } = useAuth()
  const currentUserId = user?.id as number | undefined
  const chat = useChat(currentUserId)
  const [open, setOpen] = useState(false)

  const totalUnread = chat.conversations.reduce(
    (sum, c) => sum + (c.unread_messages_count || 0),
    0,
  )

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          variant="primary"
          className="rounded-full w-14 h-14 shadow-lg flex items-center justify-center relative"
          onClick={() => setOpen(true)}
        >
          <MessageCircle />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </Button>
      </div>
      <ChatDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        currentUserId={currentUserId ?? 0}
        currentUser={user}
        {...chat}
      />
    </>
  )
}
