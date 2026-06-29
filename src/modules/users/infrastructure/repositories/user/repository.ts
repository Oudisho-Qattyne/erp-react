import type { ApiClient } from "../../../../../core/domain/common/api/ApiClient"
import {type DomainResponse } from "../../../../../core/domain/common/responce/DomainResponse"
import {type DpomainResponsePaginated } from "../../../../hr/domain/entities/common/DomainResponsePaginated"
import type { User } from "../../../domain/entities/user/user"
import type { IUserRepository } from "../../../domain/repositories/user/IUserRepository"

export const createUserRepository = (apiClient: ApiClient): IUserRepository => {
    const baseUrl = '/users'
    return (
        {
           getAllUsers : (filter : any) => apiClient.get<DpomainResponsePaginated<User[]>>(baseUrl),

           getCurrentUsers: () => apiClient.get<DomainResponse<User>>(`${baseUrl}/current`),

           createUser : (user : any) => apiClient.post<DomainResponse<User>>(baseUrl , user),
           updateUser : (id :number , user:any) => apiClient.post<DomainResponse<User>>(`${baseUrl}/${id}` , user),

           updateSignature : (id :number , signature : File) => {
            const formData = new FormData();
            formData.append('signature', signature);
            return( apiClient.post<DomainResponse<User>>(`${baseUrl}/${id}` ,formData ))
           }
        }
    )
}