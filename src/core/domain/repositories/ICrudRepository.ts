import type { DomainResponse } from "../common/responce/DomainResponse";

export interface ICrudRepository<T,TCreate , TUpdate, ID=number> {
  findById(id: ID): Promise<DomainResponse<T> | null>;
  findAll(params?: Record<string, string | boolean | number>): Promise<DomainResponse<T[]>>;
  create(entity: TCreate, idempotencyKey?: string): Promise<DomainResponse<T>>;
  update(id: ID, entity: TUpdate, idempotencyKey?: string): Promise<DomainResponse<T>>;
  delete(id: ID): Promise<void>;
}
