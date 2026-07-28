import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { DpomainResponsePaginated } from "../../../hr/domain/entities/common/DomainResponsePaginated";
import type { Conversation } from "../../domain/entities/Conversation";
import type { Message } from "../../domain/entities/Message";
import type { ChatUser } from "../../domain/entities/ChatUser";
import type { IChatRepository } from "../../domain/repositories/IChatRepository";
import type { SendMessageDto } from "../dtos/SendMessageDto";

export interface ManageChatUseCase {
  getConversations(page?: number, perPage?: number): Promise<DomainResponse<Conversation[]>>;
  getMessages(conversationId: number, page?: number, perPage?: number): Promise<DomainResponse<Message[]>>;
  sendMessage(data: SendMessageDto): Promise<DomainResponse<Message>>;
  markAsRead(conversationId: number): Promise<void>;
  getUsers(page?: number, perPage?: number): Promise<DomainResponse<ChatUser[]>>;
}

export const createManageChatUseCase = (
  chatRepository: IChatRepository,
): ManageChatUseCase => ({
  getConversations: (page, perPage) => chatRepository.getConversations(page, perPage),
  getMessages: (conversationId, page, perPage) => chatRepository.getMessages(conversationId, page, perPage),
  sendMessage: (data: SendMessageDto) => chatRepository.sendMessage(data),
  markAsRead: (conversationId) => chatRepository.markAsRead(conversationId),
  getUsers: (page, perPage) => chatRepository.getUsers(page, perPage),
});
