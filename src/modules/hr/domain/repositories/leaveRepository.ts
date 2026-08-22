import type { EntityWithNameOnly } from "../../../../core/domain/entities/EntityWithNameOnly";
import type { Leave } from "../entities/leave/leave";
import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";

export interface ILeaveTypeRepository {
    findAllLeaveTypes(filter?: any): Promise<DomainResponse<EntityWithNameOnly[]>>;
    findLeaveTypeById(id: number): Promise<DomainResponse<Leave>>;
    createLeaveType(data: any, idempotencyKey?: string): Promise<DomainResponse<Leave>>;
    updateLeaveType(id: number, data: any, idempotencyKey?: string): Promise<DomainResponse<Leave>>;
    archiveLeaveType(id: number, idempotencyKey?: string): Promise<DomainResponse<Leave>>;
    deleteLeaveType(id: number): Promise<DomainResponse<Leave>>;
    getUserEligibleLeaveTypes(filter?: { page?: number; per_page?: number }): Promise<DomainResponse<EntityWithNameOnly[]>>;
}
