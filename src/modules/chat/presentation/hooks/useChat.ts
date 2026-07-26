import { useState, useCallback, useEffect } from "react"
import { useApiClient } from "../../../../core/presentation/context/api/ApiClinetProvider"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { createChatRepository } from "../../infrastructure/repositories/ChatRepository"
import { createManageChatUseCase } from "../../application/usecases/manageChatUseCase"
import type { Conversation } from "../../domain/entities/Conversation"
import type { Message } from "../../domain/entities/Message"
import type { ChatUser } from "../../domain/valueObjects/ChatUser"
import type { SendMessageDto } from "../../application/dtos/SendMessageDto"
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
  fetchConversations: () => Promise<void>
  fetchMessages: (conversationId: number) => Promise<void>
  fetchUsers: () => Promise<void>
  sendMessage: (data: SendMessageDto) => Promise<void>
  markAsRead: (conversationId: number) => Promise<void>
  selectConversation: (conversation: Conversation) => Promise<void>
}

export const useChat = (): UseChatReturn => {
  const apiClient = useApiClient()
  const { t } = useLanguage()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<ChatUser[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>(() => initRecord(false))
  const [error, setError] = useState<Record<string, string | null>>(() => initRecord(null))

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
    await fetchMessages(conversation.id)
  }, [fetchMessages])

  const sendMessage = useCallback(async (data: SendMessageDto) => {
    setFnLoading("sendMessage", true)
    setFnError("sendMessage", null)
    try {
      const res = await useCase.sendMessage(data)
      setMessages((prev) => [...prev, res.data])
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
