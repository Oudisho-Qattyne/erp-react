import { useRef, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { MessageBubble } from "./MessageBubble"
import type { Message } from "../../domain/entities/Message"

interface MessageListProps {
  messages: Message[]
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  currentUserId: number
  onLoadMore: () => void
  hasMore: boolean
  loadingMore: boolean
}

export function MessageList({ messages, messagesEndRef, currentUserId, onLoadMore, hasMore, loadingMore }: MessageListProps) {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const prevScrollTopRef = useRef(0)
  const prevScrollHeightRef = useRef(0)
  const prevLenRef = useRef(messages.length)
  const hasMoreRef = useRef(hasMore)
  const loadingMoreRef = useRef(loadingMore)
  const onLoadMoreRef = useRef(onLoadMore)
  hasMoreRef.current = hasMore
  loadingMoreRef.current = loadingMore
  onLoadMoreRef.current = onLoadMore

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const added = messages.length - prevLenRef.current
    if (added <= 0) return
    prevLenRef.current = messages.length

    if (prevScrollHeightRef.current > 0) {
      const delta = container.scrollHeight - prevScrollHeightRef.current
      container.scrollTop = prevScrollTopRef.current + delta
      prevScrollHeightRef.current = 0
      prevScrollTopRef.current = 0
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages.length])

  const firstMsgRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMoreRef.current && !loadingMoreRef.current) {
          const container = containerRef.current
          if (container) {
            prevScrollTopRef.current = container.scrollTop
            prevScrollHeightRef.current = container.scrollHeight
          }
          onLoadMoreRef.current()
        }
      },
      { root: containerRef.current, threshold: 1 },
    )
    const el = firstMsgRef.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [messages[0]?.id])

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-card">
      {loadingMore && (
        <div className="flex justify-center py-2">
          <Loader2 size={18} className="text-primary animate-spin" />
        </div>
      )}
      {!hasMore && messages.length > 0 && (
        <div className="text-center text-xs text-text-muted py-1">{t("message_list.start_of_chat", "chat")}</div>
      )}
      {messages.map((msg, idx) => (
        <div key={msg.id} ref={idx === 0 ? firstMsgRef : undefined}>
          <MessageBubble message={msg} currentUserId={currentUserId} />
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}