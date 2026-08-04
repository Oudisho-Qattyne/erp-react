import type { TransactionType } from "../valueObjects/TransactionType";
import type { TransactionStatus } from "../valueObjects/TransactionStatus";

export interface Transaction {
  id: number;
  // addition | deduction | incoming | outgoing
  type: TransactionType;
  // pending | approved | canceled
  status: TransactionStatus;
  // Optional transaction date
  date?: string;
  // Decimal with 2 floating points, cannot be negative
  value: number;
  // Optional reason
  reason?: string;
  created_at?: string;
  updated_at?: string;
}
