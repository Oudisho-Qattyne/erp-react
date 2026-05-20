import type { DomainResponse } from "../common/responce/DomainResponse";

export interface ICrudRepository<T,TCreate , TUpdate, ID=number> {
  findById(id: ID): Promise<DomainResponse<T> | null>;
  findAll(): Promise<DomainResponse<T[]>>;
  create(entity: TCreate): Promise<DomainResponse<T>>;
  update(id: ID, entity: TUpdate): Promise<DomainResponse<T>>;
  delete(id: ID): Promise<void>;
}
