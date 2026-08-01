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

    create(data: CreateRoleData, idempotencyKey?: string): Promise<DomainResponse<Role>> {
      return repository.createRole(data, idempotencyKey);
    },

    update(id: number, data: UpdateRoleData, idempotencyKey?: string): Promise<DomainResponse<DetailedRole>> {
      return repository.updateRole(id, data, idempotencyKey);
    },

    delete(id: number): Promise<DomainResponse<[]>> {
      return repository.delteRole(id);
    },

    getPermissions(): Promise<DomainResponse<Permissions>> {
      return repository.getPermissions();
    },
  };
};
