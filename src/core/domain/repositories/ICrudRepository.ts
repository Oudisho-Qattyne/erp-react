import type { DomainResponse } from "../common/responce/DomainResponse";

export interface ICrudRepository<T, TCreate , TUpdate, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<DomainResponse<T>>;
  create(input: TCreate): Promise<T>;
  update(id: ID, input: TUpdate): Promise<T>;
  delete(id: ID): Promise<void>;
}