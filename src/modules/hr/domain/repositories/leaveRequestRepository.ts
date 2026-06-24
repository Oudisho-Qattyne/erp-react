import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";

export interface ILeaveRequestRepository{
    createLeaveRequest:() => Promise<DomainResponse<any>>
}