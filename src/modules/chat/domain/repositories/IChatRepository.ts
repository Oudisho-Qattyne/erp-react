import type { DomainResponse } from '../../../../core/domain/common/responce/DomainResponse';
import type { DpomainResponsePaginated } from '../../../hr/domain/entities/common/DomainResponsePaginated';
import type { Conversation } from '../entities/Conversation';
import type { Message } from '../entities/Message';
import type { ChatUser } from '../valueObjects/ChatUser';

export interface IChatRepository {
  getConversations(): Promise<DpomainResponsePaginated<Conversation[]>>;
  getMessages(conversationId: number): Promise<DpomainResponsePaginated<Message[]>>;
  sendMessage(data: any): Promise<DomainResponse<Message>>;
  markAsRead(conversationId: number): Promise<void>;
  getUsers(): Promise<DpomainResponsePaginated<ChatUser[]>>;
}
