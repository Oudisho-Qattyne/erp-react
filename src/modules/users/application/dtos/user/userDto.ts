import type { User } from "../../../domain/entities/user/user";

export type CreateUserDto = Omit<User, 'id' | 'signature' | 'photo'| 'status' | 'permissions' | 'created_at' | 'role'> & {
    role: number;
    password: string;
};

export type UpdateuserDto = Omit<CreateUserDto ,'password'>


export type ChangePasswordDto = {
    password:string
    password_confirmation:string
}
