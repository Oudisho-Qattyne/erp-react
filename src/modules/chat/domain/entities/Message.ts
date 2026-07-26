import type { ChatUser } from '../valueObjects/ChatUser';

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  receiver_id: number;
  body: string;
  read_at: string | null;
  created_at: string;
  sender: ChatUser;
  receiver: ChatUser;
}
