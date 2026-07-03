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
    created_at: string;
    permissions: string[];
    employee_first_name?: string;
    employee_last_name?: string;
}