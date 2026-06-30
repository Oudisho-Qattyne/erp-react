import type { DomainResponse } from "../../../../../core/domain/common/responce/DomainResponse";
import type { DpomainResponsePaginated } from "../../../../hr/domain/entities/common/DomainResponsePaginated";
import type { User } from "../../../domain/entities/user/user";
import type { IUserRepository } from "../../../domain/repositories/user/IUserRepository";
import type { FilterUserDto } from "../../dtos/user/filterUserDto";
import type { CreateUserDto, UpdateuserDto } from "../../dtos/user/userDto";


export const createManageUserUseCase = (
  repository: IUserRepository
) => {
  return {
    getAllUsers: (filter : FilterUserDto): Promise<DpomainResponsePaginated<User[]>> => {
      return repository.getAllUsers(filter);
    },

    getCurrentUser(): Promise<DomainResponse<User>> {
      return repository.getCurrentUsers();
    },

    createUser(data: CreateUserDto): Promise<DomainResponse<User>> {
      return repository.createUser(data);
    },

    updateUser(id: number, data: UpdateuserDto): Promise<DomainResponse<User>> {
      return repository.updateUser(id, data);
    },
    updateSignature( file: File): Promise<DomainResponse<User>> {
        return repository.updateSignature(file);
      },

    exportUsersExcel() {
        return repository.exportUsersExcel()
    },
    exportUsersPdf() {
        return repository.exportUsersPdf()
    },

    linkUserToEmployee(user_id : number , employee_id : number) {
        return repository.linkUserToEmployee(user_id , employee_id)
    }
  };
};
