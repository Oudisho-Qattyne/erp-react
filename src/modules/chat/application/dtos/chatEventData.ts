export interface MessageEventData {
  id: number;
  conversation_id: number;
  sender_id: number;
  receiver_id: number;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface ConversationEventData {
  id: number;
  user_one_id: number;
  user_two_id: number;
  created_at: string;
}
