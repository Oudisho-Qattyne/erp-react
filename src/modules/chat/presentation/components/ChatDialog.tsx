import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, MessageCircle, PenSquare, ArrowRight } from "lucide-react"
import { useAuth } from "../../../../core/infrastructure/auth/AuthProvider"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { useChat } from "../hooks/useChat"
import { ContactList } from "./ContactList"
import { UserList } from "./UserList"
import { ChatView } from "./ChatView"
import type { ChatUser } from "../../domain/valueObjects/ChatUser"
import type { Conversation } from "../../domain/entities/Conversation"
import type { SendMessageDto } from "../../application/dtos/SendMessageDto"
import { toast } from "sonner"

function ChatDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const currentUserId = user?.id as number | undefined
  const {
    conversations,
    messages,
    users,
    currentConversation,
    loading,
    error,
    fetchConversations,
    fetchUsers,
    selectConversation,
    sendMessage: sendMsg,
  } = useChat()

  const [showNewChat, setShowNewChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && !showNewChat) {
      fetchConversations()
    }
  }, [isOpen, showNewChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, currentConversation])

  const handleSend = (text: string) => {
    if (!currentConversation || currentUserId === undefined) return
    const receiverId =
      currentConversation.user_one_id === currentUserId
        ? currentConversation.user_two_id
        : currentConversation.user_one_id

    const dto: SendMessageDto = {
      conversation_id: currentConversation.id,
      receiver_id: receiverId,
      body: text,
    }
    sendMsg(dto)
  }

  const handleSelectConversation = (conv: Conversation) => {
    setShowNewChat(false)
    selectConversation(conv)
  }

  const handleSelectUser = (selectedUser: ChatUser) => {
    const existing = conversations.find(
      (c) => c.user_one_id === selectedUser.id || c.user_two_id === selectedUser.id,
    )
    if (existing) {
      handleSelectConversation(existing)
    } else {
      toast.info(t("new_conversation_unavailable", "chat"))
    }
  }

  const handleOpenNewChat = () => {
    setShowNewChat(true)
    if (users.length === 0) {
      fetchUsers()
    }
  }

  const handleBack = () => {
    setShowNewChat(false)
  }

  if (!isOpen) return null

  const otherUser =
    currentConversation && currentUserId !== undefined
      ? currentConversation.user_one_id === currentUserId
        ? currentConversation.user_two
        : currentConversation.user_one
      : null

  return createPortal(
    <div className="fixed inset-0 z-100000 flex items-center justify-center p-2 sm:p-4" dir="rtl">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col shadow-primary/10 animate-zoom-in overflow-hidden">
        <div className="bg-primary text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <MessageCircle size={22} />
            <h2 className="font-bold text-base">
              {showNewChat
                ? t("dialog.title_new_chat", "chat")
                : otherUser
                  ? otherUser.name
                  : t("dialog.title_conversations", "chat")}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {showNewChat && (
              <button
                type="button"
                onClick={() => setShowNewChat(false)}
                className="p-1.5 rounded-md hover:bg-white/10 transition-all cursor-pointer"
              >
                <ArrowRight size={18} className="text-white" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-danger/10 hover:text-danger transition-all cursor-pointer"
            >
              <X size={18} className="text-white cursor-pointer" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div
            className={`${currentConversation && !showNewChat ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 flex-col border-l border-border bg-background shrink-0 relative`}
          >
            {showNewChat ? (
              <UserList
                users={users}
                currentUserId={currentUserId ?? 0}
                existingConversations={conversations}
                onSelectUser={handleSelectUser}
                onClose={() => setShowNewChat(false)}
                loading={loading["fetchUsers"] ?? false}
                error={error["fetchUsers"] ?? null}
                onRetry={fetchUsers}
              />
            ) : (
              <>
                <ContactList
                  conversations={conversations}
                  selectedId={currentConversation?.id ?? null}
                  onSelect={handleSelectConversation}
                  currentUserId={currentUserId ?? 0}
                  loading={loading["fetchConversations"] ?? false}
                  error={error["fetchConversations"] ?? null}
                  onRetry={fetchConversations}
                />
                {!currentConversation && (
                  <button
                    type="button"
                    onClick={handleOpenNewChat}
                    className="absolute bottom-4 left-4 p-3 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    <PenSquare size={18} />
                  </button>
                )}
              </>
            )}
          </div>

          <div className={`${!currentConversation ? "hidden md:flex" : "flex"} flex-1`}>
            <ChatView
              conversation={currentConversation}
              messages={messages}
              messagesEndRef={messagesEndRef}
              onSend={handleSend}
              onBack={handleBack}
              loading={loading["fetchMessages"] ?? false}
              error={error["fetchMessages"] ?? null}
              currentUserId={currentUserId ?? 0}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ChatDialog
