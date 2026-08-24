import type { DomainResponse } from "../common/responce/DomainResponse";

export interface ManageEntityUsecase<T,TCreate , TUpdate, ID = number> {
  getAll(params?: Record<string, string | boolean | number>): Promise<DomainResponse<T[]>>;
  getById(id: ID): Promise<DomainResponse<T> | null>;
  create(data: TCreate, idempotencyKey?: string): Promise<DomainResponse<T>>;
  update(id: ID, data: TUpdate, idempotencyKey?: string): Promise<DomainResponse<T>>;
  delete(id: ID): Promise<void>;
}
