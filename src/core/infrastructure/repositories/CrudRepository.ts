import type { DpomainResponsePaginated } from "../../../modules/hr/domain/entities/common/DomainResponsePaginated";
import type { ApiClient } from "../../domain/common/api/ApiClient";
import type { ICrudRepository } from "../../domain/repositories/ICrudRepository";

export function createCrufRepository<T,TCreate , TUpdate, ID = number>(apiClieint: ApiClient, getUrl: string , restUrl:string): ICrudRepository<T,TCreate , TUpdate, ID> {
    return {
        findAll: async(params?: Record<string, string | boolean | number>) => {
            return apiClieint.get<DpomainResponsePaginated<T[]>>(`${getUrl}`, params ? { params } : undefined)
        },
        findById:async (id: ID) => {
            return apiClieint.get<DpomainResponsePaginated<T>>(`${restUrl}/${id}`)
        },
        create: async(data: TCreate, idempotencyKey?: string) => {
            return apiClieint.post<DpomainResponsePaginated<T>,TCreate>(`${restUrl}`, data, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined)
        },
        update: async(id: ID, data: TUpdate, idempotencyKey?: string) => {
            return apiClieint.put<DpomainResponsePaginated<T>,TUpdate>(`${restUrl}/${id}`, data, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined)
        },
        delete: async(id: ID) => {
            return apiClieint.delete(`${restUrl}/${id}`)
        }
    }
}
