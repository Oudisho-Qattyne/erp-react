export interface Person {
  id: number;
  name: string;
  primary_phone: string | null;
  secondary_phone: string | null;
  email: string | null;
  whatsapp: string | null;
  telegram: string | null;
  x: string | null;
  linkedin: string | null;
  address: string | null;
  created_at?: string;
  updated_at?: string;
}
