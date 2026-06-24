import type { DpomainResponsePaginated } from "../entities/common/DomainResponsePaginated";

import type { LeaveBalance } from "../entities/leaveBalance/leaveBalance";

export interface ILeaveBalanceRepository {
    findAllEmployeeLeaveBalances(employeeId:number ,  filter?: any): Promise<DpomainResponsePaginated<LeaveBalance[]>>;
    findAllMyLeaveBalances(filter?: any): Promise<DpomainResponsePaginated<LeaveBalance[]>>;
    adjustLeaveBalance(adjust : any) : Promise<DpomainResponsePaginated<any>>
}
