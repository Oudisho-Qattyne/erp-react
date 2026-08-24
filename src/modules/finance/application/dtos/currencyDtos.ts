import type { Currency } from "../../domain/entities/Currency";
import type { SortOrder } from "./listParams";

// is_base is server-managed and read-only; never sent in payloads
export type CurrencyPayload = Omit<Currency, "created_at" | "updated_at" | "is_base">;

export type CreateCurrencyDto = CurrencyPayload;

export type UpdateCurrencyDto = CurrencyPayload;

export type CurrencySortField =
  | "name"
  | "code"
  | "decimal_places"
  | "created_at";

export interface CurrencyFilters {
  page?: number;
  per_page?: number;
  // Partial match (LIKE) on name
  search?: string;
  // Partial match (LIKE) on code
  code?: string;
  // Exact match on is_active
  is_active?: boolean;
  // Exact match on decimal_places
  decimal_places?: number;
  // Created-at range (YYYY-MM-DD, inclusive)
  from_date?: string;
  to_date?: string;
  // Sent as sort_by[column]=asc|desc (default: created_at desc)
  sort_by?: Partial<Record<CurrencySortField, SortOrder>>;
}

export type CurrencyConversionAction = 'to_base' | 'from_base';

export interface CurrencyConversionRequest {
  action: CurrencyConversionAction;
  currency_code: string;
  amount: number;
}

export interface CurrencyConversionResult {
  action: CurrencyConversionAction;
  currency_code: string;
  amount: number;
  result: number;
}
