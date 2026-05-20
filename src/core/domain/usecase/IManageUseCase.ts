import type { DomainResponse } from "../common/responce/DomainResponse";

export interface ManageEntityUsecase<T,TCreate , TUpdate, ID = number> {
  getAll(): Promise<DomainResponse<T[]>>;
  getById(id: ID): Promise<DomainResponse<T> | null>;
  create(data: TCreate): Promise<DomainResponse<T>>;          // uses full T, as per repo interface
  update(id: ID, data: TUpdate): Promise<DomainResponse<T>>;
  delete(id: ID): Promise<void>;
}