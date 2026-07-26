import type { ChatUser } from '../valueObjects/ChatUser';

export interface Conversation {
  id: number;
  user_one_id: number;
  user_two_id: number;
  user_one: ChatUser;
  user_two: ChatUser;
  created_at: string;
}
