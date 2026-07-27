import type { ApiClient } from "../../../../core/domain/common/api/ApiClient"
import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse"
import type { DpomainResponsePaginated } from "../../../hr/domain/entities/common/DomainResponsePaginated"
import type { Conversation } from "../../domain/entities/Conversation"
import type { Message } from "../../domain/entities/Message"
import type { ChatUser } from "../../domain/entities/ChatUser"
import type { IChatRepository } from "../../domain/repositories/IChatRepository"

export const createChatRepository = (apiClient: ApiClient): IChatRepository => {
  const baseUrl = "/chat"
  return {
    getConversations: () =>
      apiClient.get<DpomainResponsePaginated<Conversation[]>>(`${baseUrl}/conversations`),

    getMessages: (conversationId: number) =>
      apiClient.get<DpomainResponsePaginated<Message[]>>(`${baseUrl}/conversations/${conversationId}/messages`),

    sendMessage: (data: any) =>
      apiClient.post<DomainResponse<Message>>(`${baseUrl}/conversations/messages`, data),

    markAsRead: (conversationId: number) =>
      apiClient.put<void>(`${baseUrl}/conversations/${conversationId}/read`),

    getUsers: () =>
      apiClient.get<DpomainResponsePaginated<ChatUser[]>>(`${baseUrl}/users`),
  }
}
