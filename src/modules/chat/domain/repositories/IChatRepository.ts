import type { DomainResponse } from '../../../../core/domain/common/responce/DomainResponse';
import type { DpomainResponsePaginated } from '../../../hr/domain/entities/common/DomainResponsePaginated';
import type { ChatUser } from '../entities/ChatUser';
import type { Conversation } from '../entities/Conversation';
import type { Message } from '../entities/Message';

export interface IChatRepository {
  getConversations(page?: number, perPage?: number): Promise<DomainResponse<Conversation[]>>;
  getMessages(conversationId: number, page?: number, perPage?: number): Promise<DomainResponse<Message[]>>;
  sendMessage(data: any): Promise<DomainResponse<Message>>;
  markAsRead(conversationId: number): Promise<void>;
  getUsers(page?: number, perPage?: number, name?: string, email?: string): Promise<DomainResponse<ChatUser[]>>;
}
