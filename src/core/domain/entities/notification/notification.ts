export interface Notification {
  id: string;
  type: string;
  notifiable_type?: string | null;
  notifiable_id?: number | string | null;
  data?: Record<string, unknown> | null;
  read_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}