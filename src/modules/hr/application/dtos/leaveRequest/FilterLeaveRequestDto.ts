import type { LeaveRequestStatus } from "../../../domain/valueObjects/leaveRequest/leaveRequestStatus";

export interface FilterLeaveRequestDto {
    page: number;
    per_page: number;
    search?: string;
    employee_id?: number;
    leave_type_id?: number;
    status?: LeaveRequestStatus;
    from_date?: string;   // YYYY-MM-DD
    to_date?: string;     // YYYY-MM-DD
    "sort_by[id]"?: "asc" | "desc";
    "sort_by[start_date]"?: "asc" | "desc";
    "sort_by[end_date]"?: "asc" | "desc";
    "sort_by[requested_units]"?: "asc" | "desc";
    "sort_by[status]"?: "asc" | "desc";
    "sort_by[created_at]"?: "asc" | "desc";
}