export interface SendMessageDto {
  conversation_id: number;
  receiver_id: number;
  body: string;
}
