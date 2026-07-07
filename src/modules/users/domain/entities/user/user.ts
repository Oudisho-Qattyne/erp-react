import type { UserStatus } from "../../valueObjects/userStatus";
import type { Role } from "../role";

export interface User {
    id: number;
    name: string;
    email: string;
    mobile: string;
    status: UserStatus;
    photo?: string;
    signature?: string;
    role: Role;
    permissions: string[];
    employee_first_name?: string;
    employee_last_name?: string;
    email_verified_at?: string;
    employee_id?: number;
    created_at: string;
    updated_at: string
}