import type { LeaveRequestStatus } from "../../../domain/valueObjects/leaveRequest/leaveRequestStatus";

export interface FilterLeaveRequestDto {
    page: number;
    per_page: number;
    search?: string;
    employee_id?: number;
    leave_type_id?: number;
    status?: LeaveRequestStatus;
    from_date?: string;
    to_date?: string;
}