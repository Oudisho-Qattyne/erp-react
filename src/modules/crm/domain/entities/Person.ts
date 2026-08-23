import type { PersonType } from "../valueObjects/PersoneType";

export interface Person {
  id: number;
  name: string;
  email: string | null;
  primary_phone_number: string | null;
  secondary_phone_number: string | null;
  whatsapp: string | null;
  telegram: string | null;
  x: string | null;
  linkedin: string | null;
  facebook: string | null;
  type: PersonType;
  role?:string;
  personable: any;
  created_at?: string;
  updated_at?: string;
}