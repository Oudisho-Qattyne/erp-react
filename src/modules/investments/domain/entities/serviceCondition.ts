export interface ServiceCondition {
  id: number;
  name: string;
  is_active: boolean;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
  pivot?: {
    note: string
  }
}
