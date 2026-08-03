import type { FeeStatus } from "../valueObjects/FeeStatus";

export interface Fee {
  id: number;
  // Alphabet letters only, min 3 and max 255 characters
  name: string;
  // Letters and digits only, no white space
  code: string;
  // Number with 2 decimal places, cannot be negative
  fee_value: number;
  fee_status: FeeStatus;
  created_at?: string;
  updated_at?: string;
}