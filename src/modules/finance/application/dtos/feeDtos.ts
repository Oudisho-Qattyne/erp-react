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
  | "id"
  | "name"
  | "code"
  | "fee_value"
  | "fee_status"
  | "created_at"
  | "updated_at";

export interface FeeFilters {
  page?: number;
  per_page?: number;
  // Search by name
  search?: string;
  // Exact-match filters
  name?: string;
  code?: string;
  status?: FeeStatus;
  sort_by?: FeeSortField;
  sort_order?: SortOrder;
}
