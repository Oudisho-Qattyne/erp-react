import type { LeaveRequest } from "../../../domain/entities/leaveRequest/leaveRequest";

export type CreateLeaveRequestDto = Omit<LeaveRequest,"id" | "employee_id" | "status" | "review_notes" | "employee_name" | "leave_type">;

export type UpdateLeaveRequestDto = Partial<Omit<LeaveRequest, "id" | "employee_id" | "employee_name" | "leave_type">>;