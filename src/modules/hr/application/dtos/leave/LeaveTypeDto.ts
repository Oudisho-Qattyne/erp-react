import type { Leave } from "../../../domain/entities/leave/leave";

export type CreateLeaveTypeDto = Omit<Leave , "id" | "created_at" | "updated_at" >

export type UpdateLeaveTypeDto = Partial<Leave>