import { useState, useCallback, useEffect, useRef } from "react"
import { useApiClient } from "../../../../core/presentation/context/api/ApiClinetProvider"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { createChatRepository } from "../../infrastructure/repositories/ChatRepository"
import { createManageChatUseCase } from "../../application/usecases/manageChatUseCase"
import { createEcho } from "../../../../core/infrastructure/echo/echo"
import { createChatEchoUseCase } from "../../application/usecases/chatEchoUseCase"
import type { Conversation } from "../../domain/entities/Conversation"
import type { Message } from "../../domain/entities/Message"
import type { ChatUser } from "../../domain/entities/ChatUser"
import type { SendMessageDto } from "../../application/dtos/SendMessageDto"
import type { MessageEventData, ConversationEventData } from "../../application/dtos/chatEventData"
import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse"
import type { DpomainResponsePaginated } from "../../../hr/domain/entities/common/DomainResponsePaginated"
import { toast } from "sonner"

const OP_KEYS = ["fetchConversations", "fetchMessages", "sendMessage", "markAsRead", "fetchUsers"] as const

function initRecord<T>(value: T): Record<string, T> {
  return Object.fromEntries(OP_KEYS.map((k) => [k, value]))
}

export interface UseChatReturn {
  conversations: Conversation[]
  messages: Message[]
  users: ChatUser[]
  currentConversation: Conversation | null
  loading: Record<string, boolean>
  isLoading: () => boolean
  error: Record<string, string | null>
  hasErrors: () => boolean
  clearError: () => void
  fetchConversations: () => Promise<DpomainResponsePaginated<Conversation[]> | undefined>
  fetchMessages: (conversationId: number) => Promise<DpomainResponsePaginated<Message[]> | undefined>
  fetchUsers: () => Promise<DpomainResponsePaginated<ChatUser[]> | undefined>
  sendMessage: (data: SendMessageDto) => Promise<DomainResponse<Message> | undefined>
  markAsRead: (conversationId: number) => Promise<void>
  selectConversation: (conversation: Conversation) => Promise<void>
}

export const useChat = (currentUserId?: number): UseChatReturn => {
  const apiClient = useApiClient()
  const { t } = useLanguage()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<ChatUser[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>(() => initRecord(false))
  const [error, setError] = useState<Record<string, string | null>>(() => initRecord(null))

  const currentConversationRef = useRef(currentConversation)
  currentConversationRef.current = currentConversation

  const echoUseCaseRef = useRef<ReturnType<typeof createChatEchoUseCase> | null>(null)

  const repository = createChatRepository(apiClient)
  const useCase = createManageChatUseCase(repository)

  const setFnLoading = (fn: string, v: boolean) => setLoading((p) => ({ ...p, [fn]: v }))
  const setFnError = (fn: string, e: string | null) => setError((p) => ({ ...p, [fn]: e }))

  const clearError = useCallback(() => setError(initRecord(null)), [])

  const fetchConversations = useCallback(async () => {
    setFnLoading("fetchConversations", true)
    setFnError("fetchConversations", null)
    try {
      const res = await useCase.getConversations()
      setConversations(res.data)
      return res
    } catch (err: any) {
      const msg = err?.message || t("chat.conversations_load_error", "chat")
      setFnError("fetchConversations", msg)
      toast.error(msg)
    } finally {
      setFnLoading("fetchConversations", false)
    }
  }, [useCase, t])

  const fetchMessages = useCallback(async (conversationId: number) => {
    setFnLoading("fetchMessages", true)
    setFnError("fetchMessages", null)
    try {
      const res = await useCase.getMessages(conversationId)
      setMessages(res.data)
      return res
    } catch (err: any) {
      const msg = err?.message || t("chat.messages_load_error", "chat")
      setFnError("fetchMessages", msg)
      toast.error(msg)
    } finally {
      setFnLoading("fetchMessages", false)
    }
  }, [useCase, t])

  const selectConversation = useCallback(async (conversation: Conversation) => {
    setCurrentConversation(conversation)
    if (conversation.unread_messages_count > 0) {
      await markAsRead(conversation.id)
    }
    await fetchMessages(conversation.id)
  }, [fetchMessages])

  const sendMessage = useCallback(async (data: SendMessageDto) => {
    setFnLoading("sendMessage", true)
    setFnError("sendMessage", null)
    try {
      const res = await useCase.sendMessage(data)
      setMessages((prev) => [...prev, res.data])
      return res
    } catch (err: any) {
      const msg = err?.message || t("chat.send_error", "chat")
      setFnError("sendMessage", msg)
      toast.error(msg)
      throw err
    } finally {
      setFnLoading("sendMessage", false)
    }
  }, [useCase, t])

  const fetchUsers = useCallback(async () => {
    setFnLoading("fetchUsers", true)
    setFnError("fetchUsers", null)
    try {
      const res = await useCase.getUsers()
      setUsers(res.data)
      return res
    } catch (err: any) {
      const msg = err?.message || t("chat.users_load_error", "chat")
      setFnError("fetchUsers", msg)
      toast.error(msg)
    } finally {
      setFnLoading("fetchUsers", false)
    }
  }, [useCase, t])

  const markAsRead = useCallback(async (conversationId: number) => {
    setFnLoading("markAsRead", true)
    setFnError("markAsRead", null)
    try {
      await useCase.markAsRead(conversationId)
    } catch (err: any) {
      const msg = err?.message || t("chat.mark_read_error", "chat")
      setFnError("markAsRead", msg)
    } finally {
      setFnLoading("markAsRead", false)
    }
  }, [useCase, t])

  const isLoading = useCallback(() => Object.values(loading).some(Boolean), [loading])
  const hasErrors = useCallback(() => Object.values(error).some((e) => e !== null), [error])

  useEffect(() => {
    fetchConversations()
  }, [])

  // Set up Echo once
  useEffect(() => {
    if (!currentUserId) return

    const echo = createEcho()

    const echoUseCase = createChatEchoUseCase(echo, currentUserId, {
      onMessageSent: (data: MessageEventData) => {
        const activeId = currentConversationRef.current?.id
        if (data.conversation_id === activeId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.id)) return prev
            return [...prev, data as unknown as Message]
          })
        }
        setConversations((prev) => {
          const existing = prev.find((c) => c.id === data.conversation_id)
          if (!existing) return prev
          return prev.map((c) =>
            c.id === data.conversation_id
              ? {
                  ...c,
                  last_message: data,
                  unread_messages_count: c.id === activeId
                    ? (c.unread_messages_count ?? 0)
                    : (c.unread_messages_count ?? 0) + 1,
                }
              : c,
          )
        })
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
    })

    echoUseCaseRef.current = echoUseCase

    if (currentConversation) {
      echoUseCase.subscribeToMessages(currentConversation.id)
    }

    return () => {
      echoUseCase.destroy()
      echoUseCaseRef.current = null
    }
  }, [currentUserId])

  // Sync message channel subscription when conversation changes
  useEffect(() => {
    const echoUseCase = echoUseCaseRef.current
    if (!echoUseCase) return

    if (currentConversation) {
      echoUseCase.subscribeToMessages(currentConversation.id)
    } else {
      echoUseCase.unsubscribeFromMessages()
    }
  }, [currentConversation?.id])

  return {
    conversations,
    messages,
    users,
    currentConversation,
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
  }
}
