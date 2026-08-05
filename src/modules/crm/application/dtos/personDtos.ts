import type { SortOrder } from "./listParams";

export type PersonSortField =
  | "id"
  | "name"
  | "primary_phone"
  | "email"
  | "created_at"
  | "updated_at";

export interface PersonFilters {
  page?: number;
  per_page?: number;
  // Partial match (LIKE) on name
  search?: string;
  // Exact-match filters
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  // Sent as sort_by[column]=asc|desc (default: created_at desc)
  sort_by?: Partial<Record<PersonSortField, SortOrder>>;
}
