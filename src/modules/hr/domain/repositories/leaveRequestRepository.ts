import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { LeaveRequest } from "../entities/leaveRequest/leaveRequest";
import type { LeaveRequestProcessOperations } from "../valueObjects/leaveRequest/leaveRequestProcessOperations";

export interface ILeaveRequestRepository{
    createLeaveRequest:(leaveRequest : any, idempotencyKey?: string) => Promise<DomainResponse<any>>,
    createEmployeeLeaveRequest:(leaveRequest : any, idempotencyKey?: string) => Promise<DomainResponse<any>>,
    
    getAllMyLeaveRequests:(filter : any) => Promise<DomainResponse<LeaveRequest[]>>,
    getAllLeaveRequests:(filter : any) => Promise<DomainResponse<LeaveRequest[]>>,
    getLeaveRequestById:(id:number) => Promise<DomainResponse<LeaveRequest>>,

    updateLeaveRequest:(id:number , leaveRequest : any, idempotencyKey?: string) => Promise<DomainResponse<LeaveRequest>>,
    
    processLeaveRequest:(id:number , operation : LeaveRequestProcessOperations , reviewNotes : string, idempotencyKey?: string) => Promise<DomainResponse<LeaveRequest>>
}