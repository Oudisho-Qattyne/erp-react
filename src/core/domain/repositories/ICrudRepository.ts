import type { DomainResponse } from "../common/responce/DomainResponse";

export interface ICrudRepository<T,TCreate , TUpdate, ID=number> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<DomainResponse<T>>;
  create(entity: TCreate): Promise<T>;
  update(id: ID, entity: TUpdate): Promise<T>;
  delete(id: ID): Promise<void>;
}
