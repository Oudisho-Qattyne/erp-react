import { Loader2, AlertCircle } from "lucide-react"
import { ChatHeader } from "./ChatHeader"
import { MessageList } from "./MessageList"
import { ChatInput } from "./ChatInput"
import { ChatEmptyState } from "./ChatEmptyState"
import type { Conversation } from "../../domain/entities/Conversation"
import type { Message } from "../../domain/entities/Message"

interface ChatViewProps {
  conversation: Conversation | null
  messages: Message[]
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  onSend: (text: string) => void
  onBack: () => void
  loading: boolean
  error: string | null
  currentUserId: number
  onLoadMoreMessages: () => void
  messagesHasMore: boolean
  messagesLoadingMore: boolean
}

export function ChatView({
  conversation,
  messages,
  messagesEndRef,
  onSend,
  onBack,
  loading,
  error,
  currentUserId,
  onLoadMoreMessages,
  messagesHasMore,
  messagesLoadingMore,
}: ChatViewProps) {
  if (!conversation) {
    return <ChatEmptyState />
  }

  return (
    <div className="flex-1 flex flex-col bg-card">
      <ChatHeader conversation={conversation} currentUserId={currentUserId} onBack={onBack} />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
            <Loader2 size={28} className="text-primary animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-danger">
              <AlertCircle size={24} />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
        <MessageList
          messages={messages}
          messagesEndRef={messagesEndRef}
          currentUserId={currentUserId}
          onLoadMore={onLoadMoreMessages}
          hasMore={messagesHasMore}
          loadingMore={messagesLoadingMore}
        />
      </div>
      <ChatInput onSend={onSend} />
    </div>
  )
}