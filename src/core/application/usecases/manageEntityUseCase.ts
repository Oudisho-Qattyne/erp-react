import type { DomainResponse } from "../../domain/common/responce/DomainResponse";
import type { ICrudRepository } from "../../domain/repositories/ICrudRepository";
import type { ManageEntityUsecase } from "../../domain/usecase/IManageUseCase";

export type EntityValidator<T> = (entity: T) => void | Promise<void>;

export function createManageEntityUsecase<T,TCreate , TUpdate, ID = number>(
  repository: ICrudRepository<T,TCreate , TUpdate, ID>,
  validator?: EntityValidator<TCreate | TUpdate>
): ManageEntityUsecase<T,TCreate , TUpdate, ID> {
  return {
    async getAll(): Promise<DomainResponse<T[]>> {
      try {
        return await repository.findAll();
      } catch (error : any) {
        throw new Error(`Failed to fetch entities: ${error.message}`);
      }
    },

    async getById(id: ID): Promise<DomainResponse<T> | null> {
      try {
        return await repository.findById(id);
      } catch (error : any) {
        // If your API throws on 404, catch and return null
        if (error.status === 404) return null;
        throw new Error(`Failed to fetch entity with id ${id}: ${error.message}`);
      }
    },

    async create(data: TCreate): Promise<DomainResponse<T>> {
      // Optionally validate before calling repo
      if (validator) {
        await validator(data);
      }
      try {
        return await repository.create(data);
      } catch (error : any) {
        throw new Error(`Failed to create entity: ${error.message}`);
      }
    },

    async update(id: ID, data: TUpdate): Promise<DomainResponse<T>> {
      try {
        return await repository.update(id, data);
      } catch (error : any) {
        throw new Error(`Failed to update entity ${id}: ${error.message}`);
      }
    },

    async delete(id: ID): Promise<void> {
      try {
        await repository.delete(id);
      } catch (error : any) {
        throw new Error(`Failed to delete entity ${id}: ${error.message}`);
      }
    },
  };
}