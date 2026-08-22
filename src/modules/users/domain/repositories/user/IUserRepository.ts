import type { DomainResponse } from "../../../../../core/domain/common/responce/DomainResponse";
import type { User } from "../../entities/user/user";

export interface IUserRepository {
    getAllUsers: (filter: any) => Promise<DomainResponse<User[]>>;
    getCurrentUsers: () => Promise<DomainResponse<User>>;

    createUser: (user: any, idempotencyKey?: string) => Promise<DomainResponse<User>>;
    updateUser: (id: number, user: any, idempotencyKey?: string) => Promise<DomainResponse<User>>;
    changePassword: (id: number, newPassword: any, idempotencyKey?: string) => Promise<DomainResponse<User>>;

    updateSignature: (signature: File, idempotencyKey?: string) => Promise<DomainResponse<User>>;
    exportUsersExcel: (idempotencyKey?: string) => Promise<DomainResponse<Blob>>;
    exportUsersPdf: (idempotencyKey?: string) => Promise<DomainResponse<Blob>>;

    linkUserToEmployee: (user_id : number, emplyee_id : number, idempotencyKey?: string) => Promise<DomainResponse<User>>
}