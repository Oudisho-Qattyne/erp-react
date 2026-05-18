import type { ApiClient } from "../../domain/common/api/ApiClient";
import { type DomainResponse } from "../../domain/common/responce/DomainResponse";
import type { ICrudRepository } from "../../domain/repositories/ICrudRepository";

export function createCrufRepository<T,TCreate , TUpdate, ID = number>(apiClieint: ApiClient, url: string): ICrudRepository<T,TCreate , TUpdate, ID> {
    return {
        findAll: async() => {
            return apiClieint.get<DomainResponse<T>>(`${url}`)
        },
        findById:async (id: ID) => {
            return apiClieint.get<T>(`${url}/${id}`)
        },
        create: async(data: TCreate) => {
            return apiClieint.post<T,TCreate>(`${url}`, data)
        },
        update: async(id: ID, data: TUpdate) => {
            return apiClieint.patch<T,TUpdate>(`${url}/${id}`, data)
        },
        delete: async(id: ID) => {
            apiClieint.delete(`${url}/${id}`)
        }
    }
}