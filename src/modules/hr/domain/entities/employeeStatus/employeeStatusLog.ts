import type { EntityWithNameOnly } from "../../../../../core/domain/entities/EntityWithNameOnly";

export interface EmployeeStatusLog {
    id: number,
    employee_id: number,
    employee_status_id: number,
    employee_status?:EntityWithNameOnly,
    employee_status_note: string,
    created_at: string
}