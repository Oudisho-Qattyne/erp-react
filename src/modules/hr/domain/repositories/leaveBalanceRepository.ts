import type { DpomainResponsePaginated } from "../entities/common/DomainResponsePaginated";
import type { EntityWithNameOnly } from "../../../../core/domain/entities/EntityWithNameOnly";
import type { Leave } from "../entities/leave/leave";
import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { LeaveBalance } from "../entities/leaveBalance/leaveBalance";

export interface ILeaveTypeRepository {
    findAllLeaveBalance(filter?: any): Promise<DpomainResponsePaginated<LeaveBalance[]>>;
    findLeaveTypeById(id: number): Promise<DpomainResponsePaginated<Leave>>;
    createLeaveType(data: any): Promise<DpomainResponsePaginated<Leave>>;
    updateLeaveType(id: number, data: any): Promise<DpomainResponsePaginated<Leave>>;
    archiveLeaveType(id: number): Promise<DpomainResponsePaginated<Leave>>;
    deleteLeaveType(id: number): Promise<DpomainResponsePaginated<Leave>>;
    getUserEligibleLeaveBalance(): Promise<DomainResponse<EntityWithNameOnly[]>>;
}
