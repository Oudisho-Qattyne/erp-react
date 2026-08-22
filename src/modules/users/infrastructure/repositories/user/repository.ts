import type { ApiClient } from "../../../../../core/domain/common/api/ApiClient"
import {type DomainResponse } from "../../../../../core/domain/common/responce/DomainResponse"
import type { User } from "../../../domain/entities/user/user"
import type { IUserRepository } from "../../../domain/repositories/user/IUserRepository"

export const createUserRepository = (apiClient: ApiClient): IUserRepository => {
    const baseUrl = '/users'
    return (
        {
           getAllUsers : (filter : any) => apiClient.get<DomainResponse<User[]>>(baseUrl, { params: filter }),

           getCurrentUsers: () => apiClient.get<DomainResponse<User>>(`${baseUrl}/current`),

           createUser : (user : any, idempotencyKey?: string) => apiClient.post<DomainResponse<User>>(baseUrl , user, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined),
           updateUser : (id :number , user:any, idempotencyKey?: string) => apiClient.post<DomainResponse<User>>(`${baseUrl}/${id}` , user, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined),
           changePassword : (id :number , newPassword:any, idempotencyKey?: string) => apiClient.post<DomainResponse<User>>(`${baseUrl}/${id}/password` , newPassword, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined),
           
           updateSignature : (signature : File, idempotencyKey?: string) => {
            const formData = new FormData();
            formData.append('signature', signature);
            return( apiClient.post<DomainResponse<User>>(`${baseUrl}/signature` ,formData, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined ))
           },
           exportUsersExcel : (idempotencyKey?: string) => apiClient.post<DomainResponse<Blob>>(`${baseUrl}/reports/excel` ,undefined, { responseType: 'blob', ...(idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : {}) }),
           exportUsersPdf : (idempotencyKey?: string) => apiClient.post<DomainResponse<Blob>>(`${baseUrl}/reports/pdf` ,undefined, { responseType: 'blob', ...(idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : {}) }),

           linkUserToEmployee : (user_id : number , employee_id : number, idempotencyKey?: string) => apiClient.post<DomainResponse<User>>(`${baseUrl}/link-to-employee` , {user_id , employee_id}, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined)
        }
    )
}