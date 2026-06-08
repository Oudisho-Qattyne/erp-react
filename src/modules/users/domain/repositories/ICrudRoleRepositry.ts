import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { Permissions } from "../entities/permissions";
import type { CreateRoleData, DetailedRole, Role, UpdateRoleData } from "../entities/role";

export interface ICrudRoleRepository{
    getRoles: () => Promise<DomainResponse<Role[]>>,
    getRoleId: (id:number) => Promise<DomainResponse<DetailedRole>>,
    createRole: (data:CreateRoleData) => Promise<DomainResponse<Role>>,
    updateRole : (id:number , data:UpdateRoleData) => Promise<DomainResponse<DetailedRole>>,
    delteRole : (id:number) => Promise<DomainResponse<[]>>,

    getPermissions : () => Promise<DomainResponse<Permissions>>
}