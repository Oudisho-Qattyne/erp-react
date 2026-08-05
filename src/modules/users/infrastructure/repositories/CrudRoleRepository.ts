import type { ApiClient } from "../../../../core/domain/common/api/ApiClient";
import { type DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { Permissions } from "../../domain/entities/permissions";
import type { DetailedRole, Role, CreateRoleData, UpdateRoleData } from "../../domain/entities/role";
import type { ICrudRoleRepository } from "../../domain/repositories/ICrudRoleRepositry";

export const createCrudRoleRepository = (apiClient: ApiClient): ICrudRoleRepository => {
    return (
        {
            getRoles() {
                return (apiClient.get<DomainResponse<Role[]>>("/users/roles"))
            },
            getRoleId(id: number) {
                return (apiClient.get<DomainResponse<DetailedRole>>(`/users/roles/${id}`))
            },
            createRole(data: CreateRoleData, idempotencyKey?: string) {
                return (apiClient.post<DomainResponse<Role>>(`/users/roles/store`, data, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined))
            },
            updateRole(id: number, data: UpdateRoleData, idempotencyKey?: string) {
                return (apiClient.post<DomainResponse<DetailedRole>>(`/users/roles/${id}`, data, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined))
            },
            delteRole(id) {
                return (apiClient.delete<DomainResponse<[]>>(`/users/roles/${id}`))
            },
            getPermissions() {
                return (apiClient.get<DomainResponse<Permissions>>(`/users/permissions`))
            },
        }
    )
}