import type { DomainResponse } from "../../../../../core/domain/common/responce/DomainResponse";
import type { User } from "../../../domain/entities/user/user";
import type { IUserRepository } from "../../../domain/repositories/user/IUserRepository";
import type { FilterUserDto } from "../../dtos/user/filterUserDto";
import type { ChangePasswordDto, CreateUserDto, UpdateuserDto } from "../../dtos/user/userDto";


export const createManageUserUseCase = (
  repository: IUserRepository
) => {
  return {
    getAllUsers: (filter : FilterUserDto): Promise<DomainResponse<User[]>> => {
      return repository.getAllUsers(filter);
    },

    getCurrentUser(): Promise<DomainResponse<User>> {
      return repository.getCurrentUsers();
    },

    createUser(data: CreateUserDto, idempotencyKey?: string): Promise<DomainResponse<User>> {
      return repository.createUser(data, idempotencyKey);
    },

    updateUser(id: number, data: UpdateuserDto, idempotencyKey?: string): Promise<DomainResponse<User>> {
      return repository.updateUser(id, data, idempotencyKey);
    },

    changePassword(id: number, data: ChangePasswordDto, idempotencyKey?: string): Promise<DomainResponse<User>> {
      return repository.changePassword(id, data, idempotencyKey);
    },

    updateSignature( file: File, idempotencyKey?: string): Promise<DomainResponse<User>> {
        return repository.updateSignature(file, idempotencyKey);
      },

    exportUsersExcel(idempotencyKey?: string) {
        return repository.exportUsersExcel(idempotencyKey)
    },
    exportUsersPdf(idempotencyKey?: string) {
        return repository.exportUsersPdf(idempotencyKey)
    },

    linkUserToEmployee(user_id : number , employee_id : number, idempotencyKey?: string) {
        return repository.linkUserToEmployee(user_id , employee_id, idempotencyKey)
    }
  };
};
