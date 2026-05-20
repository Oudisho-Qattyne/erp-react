import type { DomainPagination } from "./DomainPagination"

export interface DomainResponse<T>{
  status: string,
  plan?: any,
  pagination?:DomainPagination
  data: T[]
}