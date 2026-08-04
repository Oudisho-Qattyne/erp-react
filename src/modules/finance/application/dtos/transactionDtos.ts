import type { Transaction } from "../../domain/entities/Transaction";
import type { TransactionStatus } from "../../domain/valueObjects/TransactionStatus";
import type { TransactionType } from "../../domain/valueObjects/TransactionType";
import type { SortOrder } from "./listParams";

export type CreateTransactionDto = Omit<Transaction, "id" | "created_at" | "updated_at">;

// Status can only move forward: pending -> approved | canceled (no going back, no reset to pending)
export type UpdateTransactionStatusDto = {
  status: Exclude<TransactionStatus, "pending">;
};

// New transactions always start as pending
export const TRANSACTION_DEFAULT_STATUS: TransactionStatus = "pending";

export type TransactionSortField =
  | "id"
  | "type"
  | "status"
  | "date"
  | "value"
  | "created_at"
  | "updated_at";

export interface TransactionFilters {
  page?: number;
  per_page?: number;
  // Search on the reason field
  search?: string;
  // Exact-match filters
  type?: TransactionType;
  status?: TransactionStatus;
  date_from?: string;
  date_to?: string;
  value?: number;
  sort_by?: TransactionSortField;
  sort_order?: SortOrder;
}
