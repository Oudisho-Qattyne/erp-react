import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { useApiClient } from "../../../../core/presentation/context/api/ApiClinetProvider"
import { createChatRepository } from "../../infrastructure/repositories/ChatRepository"
import { createManageChatUseCase } from "../../application/usecases/manageChatUseCase"
import { handleApiError } from "../../../../core/presentation/utils/handleApiError"
import { createEcho } from "../../../../core/infrastructure/echo/echo"
import { subscribeUserChannel, subscribeOnlineChannel, createMessageChannelUseCase } from "../../application/usecases/chatEchoUseCase"
import type { ChatEchoCallbacks } from "../../application/usecases/chatEchoUseCase"
import type { Conversation } from "../../domain/entities/Conversation"
import type { Message } from "../../domain/entities/Message"
import type { ChatUser } from "../../domain/entities/ChatUser"
import type { SendMessageDto } from "../../application/dtos/SendMessageDto"
import type { MessageEventData, ConversationEventData } from "../../application/dtos/chatEventData"
import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse"
import type { DpomainResponsePaginated } from "../../../hr/domain/entities/common/DomainResponsePaginated"
import { playSentSound, playReceivedSound } from "../../../../core/infrastructure/audio/chatSounds"
import { useIdempotency } from "../../../../core/presentation/hooks/useIdempotency"

const OP_KEYS = ["fetchConversations", "fetchMessages", "sendMessage", "markAsRead", "fetchUsers"] as const
const PER_PAGE = 20

function initRecord<T>(value: T): Record<string, T> {
  return Object.fromEntries(OP_KEYS.map((k) => [k, value]))
}

export interface UseChatReturn {
  conversations: Conversation[]
  messages: Message[]
  users: ChatUser[]
  onlineUserIds: Set<number>
  currentConversation: Conversation | null
  loading: Record<string, boolean>
  isLoading: () => boolean
  error: Record<string, string | null>
  hasErrors: () => boolean
  clearError: () => void
  fetchConversations: () => Promise<DomainResponse<Conversation[]> | undefined>
  fetchMessages: (conversationId: number) => Promise<DomainResponse<Message[]> | undefined>
  fetchUsers: () => Promise<DomainResponse<ChatUser[]> | undefined>
  sendMessage: (data: SendMessageDto) => Promise<DomainResponse<Message> | undefined>
  markAsRead: (conversationId: number) => Promise<void>
  selectConversation: (conversation: Conversation) => Promise<void>
  clearMessages: () => void
  fetchMoreConversations: () => Promise<void>
  fetchMoreMessages: () => Promise<void>
  fetchMoreUsers: () => Promise<void>
  usersNameSearch: string
  usersEmailSearch: string
  setUsersNameSearch: (search: string) => void
  setUsersEmailSearch: (search: string) => void
  conversationsHasMore: boolean
  conversationsLoadingMore: boolean
  messagesHasMore: boolean
  messagesLoadingMore: boolean
  usersHasMore: boolean
  usersLoadingMore: boolean
  incomingMessage: (Pick<MessageEventData, 'conversation_id' | 'body' | 'sender_id'> & { sender_name: string }) | null
  clearIncomingMessage: () => void
}

export const useChat = (currentUserId?: number): UseChatReturn => {
  const apiClient = useApiClient()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<ChatUser[]>([])
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set())
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [incomingMessage, setIncomingMessage] = useState<UseChatReturn['incomingMessage']>(null)
  const clearIncomingMessage = useCallback(() => setIncomingMessage(null), [])
  const [loading, setLoading] = useState<Record<string, boolean>>(() => initRecord(false))
  const [error, setError] = useState<Record<string, string | null>>(() => initRecord(null))

  const [conversationsPage, setConversationsPage] = useState(1)
  const [conversationsHasMore, setConversationsHasMore] = useState(true)
  const [conversationsLoadingMore, setConversationsLoadingMore] = useState(false)

  const [messagesPage, setMessagesPage] = useState(1)
  const [messagesHasMore, setMessagesHasMore] = useState(true)
  const [messagesLoadingMore, setMessagesLoadingMore] = useState(false)

  const [usersPage, setUsersPage] = useState(1)
  const [usersHasMore, setUsersHasMore] = useState(true)
  const [usersLoadingMore, setUsersLoadingMore] = useState(false)
  const [usersNameSearch, setUsersNameSearch] = useState("")
  const [usersEmailSearch, setUsersEmailSearch] = useState("")

  const currentConversationRef = useRef(currentConversation)
  currentConversationRef.current = currentConversation

  const cbRef = useRef<ChatEchoCallbacks>(null as any)
  const messageChannelRef = useRef<ReturnType<typeof createMessageChannelUseCase> | null>(null)

  const repository = createChatRepository(apiClient)
  const useCase = createManageChatUseCase(repository)
  const idem = useIdempotency()

  const setFnLoading = (fn: string, v: boolean) => setLoading((p) => ({ ...p, [fn]: v }))
  const setFnError = (fn: string, e: string | null) => setError((p) => ({ ...p, [fn]: e }))

  const clearError = useCallback(() => setError(initRecord(null)), [])

  const fetchConversations = useCallback(async () => {
    setFnLoading("fetchConversations", true)
    setFnError("fetchConversations", null)
    setConversationsPage(1)
    setConversationsHasMore(true)
    try {
      const res = await useCase.getConversations(1, PER_PAGE)
      setConversations(res.data)
      if (res.pagination?.hasMore !== undefined) setConversationsHasMore(res.pagination?.hasMore)
      return res
    } catch (err: any) {
      setFnError("fetchConversations", handleApiError(err, { module: "chat" }))
    } finally {
      setFnLoading("fetchConversations", false)
    }
  }, [useCase])

  const fetchMoreConversations = useCallback(async () => {
    if (conversationsLoadingMore || !conversationsHasMore) return
    setConversationsLoadingMore(true)
    try {
      const nextPage = conversationsPage + 1
      const res = await useCase.getConversations(nextPage, PER_PAGE)
      setConversations((prev) => [...prev, ...res.data])
      setConversationsPage(nextPage)
      if (res.pagination?.hasMore !== undefined) setConversationsHasMore(res.pagination?.hasMore)
    } catch (err: any) {
      handleApiError(err, { module: "chat" })
    } finally {
      setConversationsLoadingMore(false)
    }
  }, [useCase, conversationsPage, conversationsHasMore, conversationsLoadingMore])

  const fetchMessages = useCallback(async (conversationId: number) => {
    setFnLoading("fetchMessages", true)
    setFnError("fetchMessages", null)
    setMessages([])
    setMessagesPage(1)
    setMessagesHasMore(true)
    try {
      const res = await useCase.getMessages(conversationId, 1, PER_PAGE)
      setMessages([...res.data].reverse())
      if (res.pagination?.hasMore !== undefined) setMessagesHasMore(res.pagination?.hasMore)
      return res
    } catch (err: any) {
      setFnError("fetchMessages", handleApiError(err, { module: "chat" }))
    } finally {
      setFnLoading("fetchMessages", false)
    }
  }, [useCase])

  const fetchMoreMessages = useCallback(async () => {
    const convId = currentConversationRef.current?.id
    if (!convId || messagesLoadingMore || !messagesHasMore) return
    setMessagesLoadingMore(true)
    try {
      const nextPage = messagesPage + 1
      const res = await useCase.getMessages(convId, nextPage, PER_PAGE)
      const older = [...res.data].reverse()
      setMessages((prev) => [...older, ...prev])
      setMessagesPage(nextPage)
      if (res.pagination?.hasMore !== undefined) setMessagesHasMore(res.pagination?.hasMore)
    } catch (err: any) {
      handleApiError(err, { module: "chat" })
    } finally {
      setMessagesLoadingMore(false)
    }
  }, [useCase, messagesPage, messagesHasMore, messagesLoadingMore])

  const selectConversation = useCallback(async (conversation: Conversation) => {
    setCurrentConversation(conversation)
    setMessages([])
    if (conversation.unread_messages_count && conversation.unread_messages_count > 0) {
      await markAsRead(conversation.id)
    }
    await fetchMessages(conversation.id)
  }, [fetchMessages])

  const sendMessage = useCallback(async (data: SendMessageDto) => {
    setFnLoading("sendMessage", true)
    setFnError("sendMessage", null)
    try {
      const res = await idem.run('sendMessage', data, (key) => useCase.sendMessage(data, key))
      if (res) playSentSound()
      return res
    } catch (err: any) {
      setFnError("sendMessage", handleApiError(err, { module: "chat" }))
      throw err
    } finally {
      setFnLoading("sendMessage", false)
    }
  }, [useCase, idem])

  const fetchUsers = useCallback(async (name?: string, email?: string) => {
    setFnLoading("fetchUsers", true)
    setFnError("fetchUsers", null)
    setUsersPage(1)
    setUsersHasMore(true)
    try {
      const res = await useCase.getUsers(1, PER_PAGE, name || undefined, email || undefined)
      setUsers(res.data)
      if (res.pagination?.hasMore !== undefined) setUsersHasMore(res.pagination?.hasMore)
      return res
    } catch (err: any) {
      setFnError("fetchUsers", handleApiError(err, { module: "chat" }))
    } finally {
      setFnLoading("fetchUsers", false)
    }
  }, [useCase])

  const fetchMoreUsers = useCallback(async () => {
    if (usersLoadingMore || !usersHasMore) return
    setUsersLoadingMore(true)
    try {
      const nextPage = usersPage + 1
      const res = await useCase.getUsers(nextPage, PER_PAGE, usersNameSearch || undefined, usersEmailSearch || undefined)
      setUsers((prev) => [...prev, ...res.data])
      setUsersPage(nextPage)
      if (res.pagination?.hasMore !== undefined) setUsersHasMore(res.pagination?.hasMore)
    } catch (err: any) {
      handleApiError(err, { module: "chat" })
    } finally {
      setUsersLoadingMore(false)
    }
  }, [useCase, usersPage, usersNameSearch, usersEmailSearch, usersHasMore, usersLoadingMore])

  const clearMessages = useCallback(() => {
    setMessages([])
    setCurrentConversation(null)
    setMessagesPage(1)
    setMessagesHasMore(true)
  }, [])

  const markAsRead = useCallback(async (conversationId: number) => {
    setFnLoading("markAsRead", true)
    setFnError("markAsRead", null)
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unread_messages_count: 0 } : c)),
    )
    try {
      await idem.run('markAsRead', { conversationId }, (key) => useCase.markAsRead(conversationId, key))
    } catch (err: any) {
      setFnError("markAsRead", handleApiError(err, { module: "chat" }))
    } finally {
      setFnLoading("markAsRead", false)
    }
  }, [useCase, idem])

  const isLoading = useCallback(() => Object.values(loading).some(Boolean), [loading])
  const hasErrors = useCallback(() => Object.values(error).some((e) => e !== null), [error])

  useEffect(() => {
    fetchConversations()
  }, [])

  // Keep cbRef.current always up to date
  cbRef.current = {
    onMessageSent: (data: MessageEventData) => {
      if (data.sender_id !== currentUserId) playReceivedSound()

      if (data.conversation_id === currentConversationRef.current?.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev
          return [...prev, data as unknown as Message]
        })
      }
    },

    onConversationMessageSent: (data: MessageEventData) => {
      const isActive = data.conversation_id === currentConversationRef.current?.id
      if (data.sender_id !== currentUserId && !isActive) playReceivedSound()
      setConversations((prev) => {
        const existing = prev.find((c) => c.id === data.conversation_id)
        if (!existing) return prev
        if (!isActive) {
          const senderName = existing.user_one_id === data.sender_id
            ? existing.user_one.name
            : existing.user_two.name
          setIncomingMessage({ conversation_id: data.conversation_id, body: data.body, sender_id: data.sender_id, sender_name: senderName })
        }
        return prev.map((c) =>
          c.id === data.conversation_id
            ? {
              ...c,
              last_message: data,
              unread_messages_count: isActive ? (c.unread_messages_count ?? 0) : (c.unread_messages_count ?? 0) + 1,
            }
            : c,
        )
      })
      if (data.conversation_id === currentConversationRef.current?.id) {
        markAsRead(data.conversation_id)
      }
    },

    onMessageRead: (data: MessageEventData) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === data.id ? { ...m, read_at: data.read_at } : m)),
      )
      setConversations((prev) =>
        prev.map((c) =>
          c.last_message?.id === data.id
            ? { ...c, last_message: { ...c.last_message, read_at: data.read_at } }
            : c,
        )
      )
    },

    onConversationRead: (data: ConversationEventData) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === data.id ? { ...c, unread_messages_count: 0 } : c)),
      )
    },

    onConversationCreated: () => {
      fetchConversations()
    },

    onOnlineHere: (members) => {
      setOnlineUserIds(new Set(members.map((m) => m.id)))
    },

    onOnlineJoining: (member) => {
      setOnlineUserIds((prev) => new Set([...prev, member.id]))
    },

    onOnlineLeaving: (member) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev)
        next.delete(member.id)
        return next
      })
    },
  }

  // Subscribe core channels (user + presence) — runs once, never cleans up
  useEffect(() => {
    if (!currentUserId) return

    const echo = createEcho()
    subscribeUserChannel(echo, currentUserId, cbRef)
    subscribeOnlineChannel(echo, cbRef)
  }, [currentUserId])

  // Create message channel use case — cleaned up when currentUserId changes
  useEffect(() => {
    if (!currentUserId) return

    const echo = createEcho()
    const msgUseCase = createMessageChannelUseCase(echo, cbRef)
    messageChannelRef.current = msgUseCase

    return () => {
      msgUseCase.destroy()
      messageChannelRef.current = null
    }
  }, [currentUserId])

  // Subscribe/unsubscribe message channel based on active conversation
  useEffect(() => {
    const msgUseCase = messageChannelRef.current
    if (!msgUseCase) return

    if (currentConversation) {
      msgUseCase.subscribe(currentConversation.id)
    } else {
      msgUseCase.unsubscribe()
    }
  }, [currentConversation?.id])

  const applyOnlineStatus = useCallback(
    (c: Conversation) => ({
      ...c,
      user_one: { ...c.user_one, status: onlineUserIds.has(c.user_one_id) ? 'online' : 'offline' },
      user_two: { ...c.user_two, status: onlineUserIds.has(c.user_two_id) ? 'online' : 'offline' },
    }),
    [onlineUserIds],
  )

  const conversationsWithStatus = useMemo(
    () => conversations.map(applyOnlineStatus),
    [conversations, applyOnlineStatus],
  )

  const currentConversationWithStatus = useMemo(
    () => (currentConversation ? applyOnlineStatus(currentConversation) : null),
    [currentConversation, applyOnlineStatus],
  )

  const usersWithStatus = useMemo(
    () => users.map((u) => ({ ...u, status: onlineUserIds.has(u.id) ? 'online' : 'offline' })),
    [users, onlineUserIds],
  )

  // Debounced search: re-fetch users when search changes
  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(usersNameSearch, usersEmailSearch), 300)
    return () => clearTimeout(timer)
  }, [usersNameSearch, usersEmailSearch])

  return {
    conversations: conversationsWithStatus,
    messages,
    users: usersWithStatus,
    onlineUserIds,
    usersNameSearch,
    usersEmailSearch,
    setUsersNameSearch,
    setUsersEmailSearch,
    currentConversation: currentConversationWithStatus,
    loading,
    isLoading,
    error,
    hasErrors,
    clearError,
    fetchConversations,
    fetchMessages,
    fetchUsers,
    sendMessage,
    markAsRead,
    selectConversation,
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
    incomingMessage,
    clearIncomingMessage,
  }
}