import type { DomainResponse } from "../../../../../core/domain/common/responce/DomainResponse";
import type { DpomainResponsePaginated } from "../../../../hr/domain/entities/common/DomainResponsePaginated";
import type { User } from "../../entities/user/user";

export interface IUserRepository {
    getAllUsers: (filter: any) => Promise<DpomainResponsePaginated<User[]>>;
    getCurrentUsers: () => Promise<DomainResponse<User>>;

    createUser: (user: any) => Promise<DomainResponse<User>>;
    updateUser: (id: number, user: any) => Promise<DomainResponse<User>>;

    updateSignature: (signature: File) => Promise<DomainResponse<User>>;

    exportUsersExcel: () => Promise<DomainResponse<Blob>>;
    exportUsersPdf: () => Promise<DomainResponse<Blob>>;

    linkUserToEmployee: (user_id : number, emplyee_id : number) => Promise<DomainResponse<User>>
}