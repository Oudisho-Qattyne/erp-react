import type { Fee } from "../../domain/entities/Fee";
import type { FeeStatus } from "../../domain/valueObjects/FeeStatus";
import type { SortOrder } from "./listParams";

export type CreateFeeDto = Omit<Fee, "id" | "created_at" | "updated_at">;

// Only name and fee_status can be updated; code and fee_value are immutable
export interface UpdateFeeDto {
  name: Fee["name"];
  fee_status: FeeStatus;
}

export type FeeSortField =
  | "name"
  | "code"
  | "fee_value"
  | "created_at";

export interface FeeFilters {
  page?: number;
  per_page?: number;
  // Partial match (LIKE) on name
  search?: string;
  // Partial match (LIKE) on code
  code?: string;
  // Exact match on fee_status
  status?: FeeStatus;
  // Exact match on fee_value
  value?: number;
  // Minimum fee_value (inclusive)
  value_from?: number;
  // Maximum fee_value (inclusive)
  value_to?: number;
  // Created-at range (YYYY-MM-DD, inclusive)
  from_date?: string;
  to_date?: string;
  // Sent as sort_by[column]=asc|desc (default: created_at desc)
  sort_by?: Partial<Record<FeeSortField, SortOrder>>;
}
