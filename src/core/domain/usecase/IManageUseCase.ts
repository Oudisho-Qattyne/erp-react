import type { DpomainResponsePaginated } from "../../../modules/hr/domain/entities/common/DomainResponsePaginated";

export interface ManageEntityUsecase<T,TCreate , TUpdate, ID = number> {
  getAll(params?: Record<string, string | boolean | number>): Promise<DpomainResponsePaginated<T[]>>;
  getById(id: ID): Promise<DpomainResponsePaginated<T> | null>;
  create(data: TCreate, idempotencyKey?: string): Promise<DpomainResponsePaginated<T>>;
  update(id: ID, data: TUpdate, idempotencyKey?: string): Promise<DpomainResponsePaginated<T>>;
  delete(id: ID): Promise<void>;
}
