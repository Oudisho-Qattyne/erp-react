import type { DpomainResponsePaginated } from "../../../modules/hr/domain/entities/common/DomainResponsePaginated";

export interface ICrudRepository<T,TCreate , TUpdate, ID=number> {
  findById(id: ID): Promise<DpomainResponsePaginated<T> | null>;
  findAll(params?: Record<string, string | boolean | number>): Promise<DpomainResponsePaginated<T[]>>;
  create(entity: TCreate, idempotencyKey?: string): Promise<DpomainResponsePaginated<T>>;
  update(id: ID, entity: TUpdate, idempotencyKey?: string): Promise<DpomainResponsePaginated<T>>;
  delete(id: ID): Promise<void>;
}
