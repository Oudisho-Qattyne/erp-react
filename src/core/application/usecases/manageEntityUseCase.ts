import type { DpomainResponsePaginated } from "../../../modules/hr/domain/entities/common/DomainResponsePaginated";
import type { ICrudRepository } from "../../domain/repositories/ICrudRepository";
import type { ManageEntityUsecase } from "../../domain/usecase/IManageUseCase";

export type EntityValidator<T> = (entity: T) => void | Promise<void>;

export function createManageEntityUsecase<T,TCreate , TUpdate, ID = number>(
  repository: ICrudRepository<T,TCreate , TUpdate, ID>,
  validator?: EntityValidator<TCreate | TUpdate>
): ManageEntityUsecase<T,TCreate , TUpdate, ID> {
  return {
    async getAll(params?: Record<string, string | boolean | number>): Promise<DpomainResponsePaginated<T[]>> {
      try {
        return await repository.findAll(params);
      } catch (error : any) {
        throw error;
      }
    },

    async getById(id: ID): Promise<DpomainResponsePaginated<T> | null> {
      try {
        return await repository.findById(id);
      } catch (error : any) {
        if (error.status === 404) return null;
        throw error;
      }
    },

    async create(data: TCreate): Promise<DpomainResponsePaginated<T>> {
      if (validator) {
        await validator(data);
      }
      try {
        return await repository.create(data);
      } catch (error : any) {
        throw error;
      }
    },

    async update(id: ID, data: TUpdate): Promise<DpomainResponsePaginated<T>> {
      try {
        return await repository.update(id, data);
      } catch (error : any) {
        throw error;
      }
    },

    async delete(id: ID): Promise<void> {
      try {
        await repository.delete(id);
      } catch (error : any) {
        throw error;
      }
    },
  };
}
