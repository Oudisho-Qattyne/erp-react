import type { ApiClient } from "../../../../core/domain/common/api/ApiClient";
import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { LeaveBalance } from "../../domain/entities/leaveBalance/leaveBalance";
import type { ILeaveBalanceRepository } from "../../domain/repositories/leaveBalanceRepository";

export const createLeaveBalanceRepository = (apiClient: ApiClient): ILeaveBalanceRepository => {
  const baseUrl = '/hr/leave-balance';

return{
    findAllMyLeaveBalances(filter?: any) {
        return apiClient.get<DomainResponse<LeaveBalance[]>>(`${baseUrl}/my`, { params: filter as Record<string, string | number | boolean | (string | number)[]> })
    },
    findAllEmployeeLeaveBalances(employeeId: number | undefined, filter?: any) {
        return apiClient.get<DomainResponse<LeaveBalance[]>>(baseUrl, { params: { ...filter, ...(employeeId !== undefined ? { employee_id: employeeId } : {}) } as Record<string, string | number | boolean | (string | number)[]> })
    },
    adjustLeaveBalance(adjust: any, idempotencyKey?: string) {
        return apiClient.post<DomainResponse<LeaveBalance>>(`${baseUrl}/adjust` , adjust, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined)
    },
}
}
