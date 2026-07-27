import type { ChatUser } from "./ChatUser";

export interface Conversation {
  id: number;
  user_one_id: number;
  user_two_id: number;
  user_one: ChatUser;
  user_two: ChatUser;
  created_at: string;
  unread_messages_count?: number;
  last_message?: {
    id: number;
    conversation_id: number;
    sender_id: number;
    receiver_id: number;
    body: string;
    read_at: string | null;
    created_at: string;
  };
}
