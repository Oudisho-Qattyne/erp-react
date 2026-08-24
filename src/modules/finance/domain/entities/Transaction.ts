import type { TransactionType } from "../valueObjects/TransactionType";
import type { TransactionStatus } from "../valueObjects/TransactionStatus";
import type { TransactionableType } from "../valueObjects/TransactionableType";

export interface Transaction {
  id: number;
  // incoming | outgoing
  transaction_type: TransactionType;
  // pending | approved | canceled
  transaction_status: TransactionStatus;
  transaction_date?: string;
  // Decimal with 2 floating points, cannot be negative
  transaction_value: number;
  // Optional reason
  reason?: string;
  transactionable_type?: TransactionableType;
  transactionable_id?: number;
  transactionable?: Record<string, any>;
  sourceable_type?: string;
  sourceable_id?: number;
  sourceable?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}
