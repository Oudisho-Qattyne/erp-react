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
    updateSignature(id: number, file: File): Promise<DomainResponse<User>> {
        return repository.updateSignature(id , file);
      },

    delete(id: number): Promise<DomainResponse<[]>> {
      return repository.delteRole(id);
    },

    getPermissions(): Promise<DomainResponse<Permissions>> {
      return repository.getPermissions();
    },
  };
};
