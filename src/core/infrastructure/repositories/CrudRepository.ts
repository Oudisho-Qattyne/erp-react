import type { ApiClient } from "../../domain/api/ApiClient";
import type { ICrudRepository } from "../../domain/repositories/ICrudRepository";

export function createCrudRepository<T>(apiClient: ApiClient , url :string): ICrudRepository<T> {
    return {
        create: (entity: T) => {
            return  apiClient.post( url , entity )
        },
        findAll: () => {
            return apiClient.get<T[]>(url)
        },
        findById: (id:number) =>{
            return apiClient.get<T>(`${url}/${id}`)
        },
        update : (id:number , entity : Partial<T>) =>{
            return apiClient.patch(`${url}/${id}`, entity)
        },
        delete : (id:number) => {
            return apiClient.delete(`${url}/${id}`)
        }
    }
}