import type { EntityWithNameOnly } from "../../../../../core/domain/entities/EntityWithNameOnly"

export interface JobStatusLog {
    id: number,
    employee_id: number,
    job_status_id: number,
    job_status?: EntityWithNameOnly;
    job_status_note: string,
    created_at: string
}