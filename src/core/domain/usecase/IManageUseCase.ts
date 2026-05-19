import type { DomainResponse } from "../common/responce/DomainResponse";

export interface ManageEntityUsecase<T,TCreate , TUpdate, ID = number> {
  getAll(): Promise<DomainResponse<T>>;
  getById(id: ID): Promise<T | null>;
  create(data: TCreate): Promise<T>;          // uses full T, as per repo interface
  update(id: ID, data: TUpdate): Promise<T>;
  delete(id: ID): Promise<void>;
}