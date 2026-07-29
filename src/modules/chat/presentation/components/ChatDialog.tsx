import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, MessageCircle, PenSquare, ArrowRight } from "lucide-react"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { ContactList } from "./ContactList"
import { UserList } from "./UserList"
import { ChatView } from "./ChatView"
import type { ChatUser } from "../../domain/entities/ChatUser"
import type { Conversation } from "../../domain/entities/Conversation"
import type { Message } from "../../domain/entities/Message"
import type { SendMessageDto } from "../../application/dtos/SendMessageDto"
import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse"
import type { DpomainResponsePaginated } from "../../../hr/domain/entities/common/DomainResponsePaginated"

interface ChatDialogProps {
  isOpen: boolean
  onClose: () => void
  currentUserId: number
  currentUser: any
  conversations: Conversation[]
  messages: Message[]
  users: ChatUser[]
  currentConversation: Conversation | null
  loading: Record<string, boolean>
  error: Record<string, string | null>
  fetchConversations: () => Promise<DomainResponse<Conversation[]> | undefined>
  fetchMessages: (conversationId: number) => Promise<DomainResponse<Message[]> | undefined>
  fetchUsers: (name?: string, email?: string) => Promise<DomainResponse<ChatUser[]> | undefined>
  selectConversation: (conversation: Conversation) => Promise<void>
  sendMessage: (data: SendMessageDto) => Promise<DomainResponse<Message> | undefined>
  markAsRead: (conversationId: number) => Promise<void>
  clearMessages: () => void
  fetchMoreConversations: () => Promise<void>
  fetchMoreMessages: () => Promise<void>
  fetchMoreUsers: () => Promise<void>
  conversationsHasMore: boolean
  conversationsLoadingMore: boolean
  messagesHasMore: boolean
  messagesLoadingMore: boolean
  usersHasMore: boolean
  usersLoadingMore: boolean
  usersNameSearch: string
  usersEmailSearch: string
  setUsersNameSearch: (search: string) => void
  setUsersEmailSearch: (search: string) => void
}

function ChatDialog({
  isOpen,
  onClose,
  currentUserId,
  currentUser,
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
  markAsRead,
  clearMessages,
  fetchMoreConversations,
  fetchMoreMessages,
  fetchMoreUsers,
  conversationsHasMore,
  conversationsLoadingMore,
  messagesHasMore,
  messagesLoadingMore,
  usersHasMore,
  usersLoadingMore,
  usersNameSearch,
  usersEmailSearch,
  setUsersNameSearch,
  setUsersEmailSearch,
}: ChatDialogProps) {
  const { t } = useLanguage()

  const [showNewChat, setShowNewChat] = useState(false)
  const [newConversationUser, setNewConversationUser] = useState<ChatUser | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && !showNewChat) {
      fetchConversations()
    }
  }, [isOpen, showNewChat])

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
  }, [newConversationUser, currentConversation, isOpen])

  const createPlaceholderConversation = (otherUser: ChatUser): Conversation => ({
    id: 0,
    user_one_id: currentUserId,
    user_two_id: otherUser.id,
    user_one: { id: currentUserId, name: currentUser?.name || "", email: currentUser?.email || "", photo: undefined, status: "online" },
    user_two: otherUser,
    created_at: new Date().toISOString(),
    unread_messages_count: 0,
  })

  const activeConversation = newConversationUser
    ? createPlaceholderConversation(newConversationUser)
    : currentConversation

  const handleSend = async (text: string) => {
    if (newConversationUser) {
      const dto: SendMessageDto = {
        receiver_id: newConversationUser.id,
        body: text,
      }
      const msgRes = await sendMsg(dto)
      if (msgRes) {
        const res = await fetchConversations()
        if (res) {
          const newConversation = res.data.find(
            (c: Conversation) => c.user_one_id === newConversationUser.id || c.user_two_id === newConversationUser.id,
          )
          if (newConversation) {
            selectConversation(newConversation)
          }
        }
      }
      setNewConversationUser(null)
    } else if (currentConversation) {
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
  }

  const handleSelectConversation = async(conv: Conversation) => {
    setShowNewChat(false)
    setNewConversationUser(null)
    selectConversation(conv)
  }

  const handleSelectUser = (selectedUser: ChatUser) => {
    const existing = conversations.find(
      (c) => c.user_one_id === selectedUser.id || c.user_two_id === selectedUser.id,
    )
    if (existing) {
      handleSelectConversation(existing)
    } else {
      clearMessages()
      setShowNewChat(false)
      setNewConversationUser(selectedUser)
    }
  }

  const handleOpenNewChat = () => {
    setShowNewChat(true)
    fetchUsers()
  }

  const handleBack = () => {
    setNewConversationUser(null)
    setShowNewChat(false)
    clearMessages()
  }

  if (!isOpen) return null

  const otherUser =
    activeConversation
      ? activeConversation.user_one_id === currentUserId
        ? activeConversation.user_two
        : activeConversation.user_one
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
            className={`${activeConversation && !showNewChat ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 flex-col border-l border-border bg-background shrink-0 relative`}
          >
            {showNewChat ? (
              <UserList
                users={users}
                currentUserId={currentUserId}
                existingConversations={conversations}
                onSelectUser={handleSelectUser}
                onClose={() => setShowNewChat(false)}
                loading={loading["fetchUsers"] ?? false}
                error={error["fetchUsers"] ?? null}
                onRetry={fetchUsers}
                onLoadMore={fetchMoreUsers}
                hasMore={usersHasMore}
                loadingMore={usersLoadingMore}
                nameSearch={usersNameSearch}
                emailSearch={usersEmailSearch}
                onNameSearchChange={setUsersNameSearch}
                onEmailSearchChange={setUsersEmailSearch}
              />
            ) : (
              <>
                <ContactList
                  conversations={conversations}
                  selectedId={activeConversation && !newConversationUser ? activeConversation.id : null}
                  onSelect={handleSelectConversation}
                  currentUserId={currentUserId}
                  loading={loading["fetchConversations"] ?? false}
                  error={error["fetchConversations"] ?? null}
                  onRetry={fetchConversations}
                  onLoadMore={fetchMoreConversations}
                  hasMore={conversationsHasMore}
                  loadingMore={conversationsLoadingMore}
                />
                  <button
                    type="button"
                    onClick={handleOpenNewChat}
                    className="absolute bottom-4 left-4 p-3 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    <PenSquare size={18} />
                  </button>
              </>
            )}
          </div>

          <div className={`${!activeConversation ? "hidden md:flex" : "flex"} flex-1`}>
            <ChatView
              conversation={activeConversation}
              messages={messages}
              messagesEndRef={messagesEndRef}
              onSend={handleSend}
              onBack={handleBack}
              loading={loading["fetchMessages"] ?? false}
              error={error["fetchMessages"] ?? null}
              currentUserId={currentUserId}
              onLoadMoreMessages={fetchMoreMessages}
              messagesHasMore={messagesHasMore}
              messagesLoadingMore={messagesLoadingMore}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ChatDialog