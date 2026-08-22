import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { Permissions } from "../entities/permissions";
import type { CreateRoleData, DetailedRole, Role, UpdateRoleData } from "../entities/role";

export interface ICrudRoleRepository{
    getRoles: (filter?: { page?: number; per_page?: number }) => Promise<DomainResponse<Role[]>>,
    getRoleId: (id:number) => Promise<DomainResponse<DetailedRole>>,
    createRole: (data:CreateRoleData, idempotencyKey?: string) => Promise<DomainResponse<Role>>,
    updateRole : (id:number , data:UpdateRoleData, idempotencyKey?: string) => Promise<DomainResponse<DetailedRole>>,
    delteRole : (id:number) => Promise<DomainResponse<[]>>,

    getPermissions : () => Promise<DomainResponse<Permissions>>
}