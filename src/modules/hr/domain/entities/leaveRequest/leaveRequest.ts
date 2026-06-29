import type { LeaveRequestStatus } from "../../valueObjects/leaveRequest/leaveRequestStatus";
import type { EmployeeListItem } from "../EmployeeListItem";
import type { Leave } from "../leave/leave";

export interface LeaveRequest {
    id: number;
    employee_id: number;
    leave_type_id: number;
    start_date: string;          // formatted as DD-MM-YYYY
    end_date: string;            // formatted as DD-MM-YYYY
    requested_units: number;     // float
    reason: string;
    status: LeaveRequestStatus
    review_notes: string | null;
    employee?: EmployeeListItem; // included only when employee relation is loaded
    leave_type?: Leave;              // TODO: replace with LeaveType interface once defined
}