import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";

import type { LeaveBalance } from "../entities/leaveBalance/leaveBalance";
import type { FilterLeaveBalancesDto } from "../../application/dtos/LeaveBalance/FilterLeaveBalanceDto";
import type { AdjustLeaveBalanceDto } from "../../application/dtos/LeaveBalance/AdjustLeaveBalanceDto";

export interface ILeaveBalanceRepository {
    findAllEmployeeLeaveBalances(employeeId?: number, filter?: FilterLeaveBalancesDto): Promise<DomainResponse<LeaveBalance[]>>;
    findAllMyLeaveBalances(filter?: FilterLeaveBalancesDto): Promise<DomainResponse<LeaveBalance[]>>;
    adjustLeaveBalance(adjust: AdjustLeaveBalanceDto, idempotencyKey?: string): Promise<DomainResponse<LeaveBalance>>;
}
