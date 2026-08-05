import type { Transaction } from "../../domain/entities/Transaction";
import type { TransactionStatus } from "../../domain/valueObjects/TransactionStatus";
import type { TransactionType } from "../../domain/valueObjects/TransactionType";
import type { SortOrder } from "./listParams";

// formatted_transaction_date is computed by the backend
export type CreateTransactionDto = Omit<
  Transaction,
  "id" | "created_at" | "updated_at" | "formatted_transaction_date"
>;

// Status can only move forward: pending -> approved | canceled (no going back, no reset to pending)
export type UpdateTransactionStatusDto = {
  transaction_status: Exclude<TransactionStatus, "pending">;
};

// New transactions always start as pending
export const TRANSACTION_DEFAULT_STATUS: TransactionStatus = "pending";

export type TransactionSortField =
  | "transaction_value"
  | "transaction_date"
  | "created_at";

export interface TransactionFilters {
  page?: number;
  per_page?: number;
  // Partial match (LIKE) on reason
  search?: string;
  // Exact-match filters
  type?: TransactionType;
  status?: TransactionStatus;
  // Exact match on transaction_value
  value?: number;
  // Minimum transaction_value (inclusive)
  value_from?: number;
  // Maximum transaction_value (inclusive)
  value_to?: number;
  // Minimum transaction_date (inclusive)
  from_date?: string;
  // Maximum transaction_date (inclusive)
  to_date?: string;
  // Sent as sort_by[field]=asc|desc
  sort_by?: Partial<Record<TransactionSortField, SortOrder>>;
}
