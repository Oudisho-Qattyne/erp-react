import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { DpomainResponsePaginated } from "../entities/common/DomainResponsePaginated";
import type { LeaveRequest } from "../entities/leaveRequest/leaveRequest";
import type { LeaveRequestProcessOperations } from "../valueObjects/leaveRequest/leaveRequestProcessOperations";

export interface ILeaveRequestRepository{
    createLeaveRequest:(leaveRequest : any) => Promise<DomainResponse<any>>,

    getAllMyLeaveRequests:(filter : any) => Promise<DpomainResponsePaginated<LeaveRequest[]>>,
    getAllLeaveRequests:(filter : any) => Promise<DpomainResponsePaginated<LeaveRequest[]>>,
    getLeaveRequestById:(id:number) => Promise<DomainResponse<LeaveRequest>>,

    updateLeaveRequest:(id:number , leaveRequest : any) => Promise<DomainResponse<LeaveRequest>>,
    
    processLeaveRequest:(id:number , operation : LeaveRequestProcessOperations , reviewNotes : string) => Promise<DomainResponse<LeaveRequest>>
}