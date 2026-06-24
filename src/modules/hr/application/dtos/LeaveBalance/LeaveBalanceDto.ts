import type { LeaveBalance } from "../../../domain/entities/leaveBalance/leaveBalance"

export type CreateLeaveBalanceTypeDto = Omit<LeaveBalance , "id" | "created_at" | "updated_at" >

export type UpdateLeaveBalanceTypeDto = Partial<LeaveBalance>