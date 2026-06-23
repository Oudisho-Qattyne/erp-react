import type { ApiClient } from "../../../../core/domain/common/api/ApiClient";
import { type DpomainResponsePaginated } from "../../domain/entities/common/DomainResponsePaginated";
import type { LeaveBalance } from "../../domain/entities/leaveBalance/leaveBalance";
import type { ILeaveBalanceRepository } from "../../domain/repositories/leaveBalanceRepository";

export const createLeaveBalanceRepository = (apiClient: ApiClient): ILeaveBalanceRepository => {
  const baseUrl = '/hr/leave-balance';

return{
    findAllMyLeaveBalances(filter?: any) {
        return apiClient.get<DpomainResponsePaginated<LeaveBalance[]>>(`${baseUrl}/my`, { params: filter })
    },
    findAllEmployeeLeaveBalances(employeeId : number, filter?: any) {
        return apiClient.get<DpomainResponsePaginated<LeaveBalance[]>>(baseUrl, { params: filter })
    },
    adjustLeaveBalance(adjust : any) {
        return apiClient.post<DpomainResponsePaginated<any>>(`${baseUrl}/adjust` , adjust)
    },
}
}