import type { SortOrder } from "./listParams";

export type PersonSortField =
  | "id"
  | "name"
  | "primary_phone_number"
  | "email"
  | "created_at"
  | "updated_at";

export type PersonType = "employee" | "investor";

export interface PersonFilters {
  page?: number;
  per_page?: number;
  // Partial match (LIKE) across name, email, phones, whatsapp and social handles
  search?: string;
  // Exact-match filters
  name?: string;
  email?: string;
  primary_phone_number?: string;
  secondary_phone_number?: string;
  whatsapp?: string;
  telegram?: string;
  x?: string;
  linkedin?: string;
  facebook?: string;
  type?: PersonType;
  role?: string;
  // Sent as sort_by[column]=asc|desc (default: created_at desc)
  sortColumn?: string;
  sortOrder?: SortOrder;
}