import type { ILeaveRequestRepository } from "../../../domain/repositories/leaveRequestRepository"
import type { LeaveRequestProcessOperations } from "../../../domain/valueObjects/leaveRequest/leaveRequestProcessOperations"
import type { FilterLeaveRequestDto } from "../../dtos/leaveRequest/FilterLeaveRequestDto"
import type { CreateLeaveRequestDto, UpdateLeaveRequestDto } from "../../dtos/leaveRequest/leaveRequest"

export const createManageLeaveRequestUseCase = (repository: ILeaveRequestRepository) => {
  return {
        createLeaveRequset : (leaveRequest : CreateLeaveRequestDto, idempotencyKey?: string) => repository.createLeaveRequest(leaveRequest, idempotencyKey),

        findAllEmployeeLeaveRequests : (filter : FilterLeaveRequestDto) => repository.getAllLeaveRequests(filter),
        findAllMyLeaveRequests : (filter : FilterLeaveRequestDto) => repository.getAllMyLeaveRequests(filter),
        findLeaveRequestById : (id:number) => repository.getLeaveRequestById(id),

        updateLeaveRequest : (id:number , leaveRequest : UpdateLeaveRequestDto, idempotencyKey?: string) => repository.updateLeaveRequest(id , leaveRequest, idempotencyKey),

        processleaveRequest : (id:number , operation : LeaveRequestProcessOperations ,reviewNotes:string, idempotencyKey?: string ) => repository.processLeaveRequest(id,operation,reviewNotes,idempotencyKey)
  }
}
