import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { DpomainResponsePaginated } from "../../../hr/domain/entities/common/DomainResponsePaginated";
import type { Conversation } from "../../domain/entities/Conversation";
import type { Message } from "../../domain/entities/Message";
import type { ChatUser } from "../../domain/valueObjects/ChatUser";
import type { IChatRepository } from "../../domain/repositories/IChatRepository";
import type { SendMessageDto } from "../dtos/SendMessageDto";

export interface ManageChatUseCase {
  getConversations(): Promise<DpomainResponsePaginated<Conversation[]>>;
  getMessages(conversationId: number): Promise<DpomainResponsePaginated<Message[]>>;
  sendMessage(data: SendMessageDto): Promise<DomainResponse<Message>>;
  markAsRead(conversationId: number): Promise<void>;
  getUsers(): Promise<DpomainResponsePaginated<ChatUser[]>>;
}

export const createManageChatUseCase = (
  chatRepository: IChatRepository,
): ManageChatUseCase => ({
  getConversations: () => chatRepository.getConversations(),
  getMessages: (conversationId) => chatRepository.getMessages(conversationId),
  sendMessage: (data: SendMessageDto) => chatRepository.sendMessage(data),
  markAsRead: (conversationId) => chatRepository.markAsRead(conversationId),
  getUsers: () => chatRepository.getUsers(),
});
