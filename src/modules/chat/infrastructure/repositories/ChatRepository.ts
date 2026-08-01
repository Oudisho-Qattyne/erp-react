import type { ApiClient } from "../../../../core/domain/common/api/ApiClient"
import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse"
import type { DpomainResponsePaginated } from "../../../hr/domain/entities/common/DomainResponsePaginated"
import type { Conversation } from "../../domain/entities/Conversation"
import type { Message } from "../../domain/entities/Message"
import type { ChatUser } from "../../domain/entities/ChatUser"
import type { IChatRepository } from "../../domain/repositories/IChatRepository"

export const createChatRepository = (apiClient: ApiClient): IChatRepository => {
  const baseUrl = "/chat"
  const paginate = (page?: number, perPage?: number, name?: string, email?: string) => ({
    params: { ...(page ? { page } : {}), ...(perPage ? { per_page: perPage } : {}), ...(name ? { name } : {}), ...(email ? { email } : {}) },
  })
  return {
    getConversations: (page?, perPage?) =>
      apiClient.get<DpomainResponsePaginated<Conversation[]>>(`${baseUrl}/conversations`, paginate(page, perPage)),

    getMessages: (conversationId: number, page?, perPage?) =>
      apiClient.get<DpomainResponsePaginated<Message[]>>(
        `${baseUrl}/conversations/${conversationId}/messages`,
        paginate(page, perPage),
      ),

    sendMessage: (data: any, idempotencyKey?: string) =>
      apiClient.post<DomainResponse<Message>>(`${baseUrl}/conversations/messages`, data,
        idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined),

    markAsRead: (conversationId: number, idempotencyKey?: string) =>
      apiClient.put<void>(`${baseUrl}/conversations/${conversationId}/read`, undefined,
        idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined),

    getUsers: (page?, perPage?, name?, email?) =>
      apiClient.get<DpomainResponsePaginated<ChatUser[]>>(`${baseUrl}/users`, paginate(page, perPage, name, email)),
  }
}
