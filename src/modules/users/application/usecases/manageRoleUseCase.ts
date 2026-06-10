import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { ICrudRoleRepository } from "../../domain/repositories/ICrudRoleRepositry";
import type { Role, DetailedRole } from "../../domain/entities/role";
import type { Permissions } from "../../domain/entities/permissions";
import type { CreateRoleData, UpdateRoleData } from "../dtos/roleDto";

export const createManageRoleUseCase = (
  repository: ICrudRoleRepository
) => {
  return {
    getAll(): Promise<DomainResponse<Role[]>> {
      return repository.getRoles();
    },

    getById(id: number): Promise<DomainResponse<DetailedRole>> {
      return repository.getRoleId(id);
    },

    create(data: CreateRoleData): Promise<DomainResponse<Role>> {
      return repository.createRole(data);
    },

    update(id: number, data: UpdateRoleData): Promise<DomainResponse<DetailedRole>> {
      return repository.updateRole(id, data);
    },

    delete(id: number): Promise<DomainResponse<[]>> {
      return repository.delteRole(id);
    },

    getPermissions(): Promise<DomainResponse<Permissions>> {
      return repository.getPermissions();
    },
  };
};
