import type { ApiClient } from "../../../../core/domain/common/api/ApiClient";
import {type DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import { type DpomainResponsePaginated } from "../../domain/entities/common/DomainResponsePaginated";
import {type LeaveRequest } from "../../domain/entities/leaveRequest/leaveRequest";
import type { ILeaveRequestRepository } from "../../domain/repositories/leaveRequestRepository";
import type { LeaveRequestProcessOperations } from "../../domain/valueObjects/leaveRequest/leaveRequestProcessOperations";

export const createLeaveRequesteRepository = (apiClient: ApiClient): ILeaveRequestRepository => {
  const baseUrl = '/hr/leave-requests';

return{
    createLeaveRequest : (leaveRequest : any, idempotencyKey?: string) => apiClient.post<DomainResponse<LeaveRequest>>(baseUrl , leaveRequest, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined),
    createEmployeeLeaveRequest : (leaveRequest : any, idempotencyKey?: string) => apiClient.post<DomainResponse<LeaveRequest>>(baseUrl , leaveRequest, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined),

    getAllLeaveRequests:(filter : any) => apiClient.get<DomainResponse<LeaveRequest[]>>(baseUrl , {params:filter}),
    getAllMyLeaveRequests:(filter : any) => apiClient.get<DomainResponse<LeaveRequest[]>>(`${baseUrl}/my` , {params:filter}),
    getLeaveRequestById:(id :number) => apiClient.get<DomainResponse<LeaveRequest>>(`${baseUrl}/${id}`),

    updateLeaveRequest:(id :number , leaveRequest : any, idempotencyKey?: string) => apiClient.put<DomainResponse<LeaveRequest>>(`${baseUrl}/${id}` , leaveRequest, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined),

    processLeaveRequest : (id : number, operation : LeaveRequestProcessOperations, reviewNotes : string, idempotencyKey?: string) => apiClient.post<DomainResponse<LeaveRequest>>(`${baseUrl}/${id}/${operation}` , {review_notes:reviewNotes}, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined)
}
}