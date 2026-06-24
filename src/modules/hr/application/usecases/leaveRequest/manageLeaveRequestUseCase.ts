import type { ILeaveRequestRepository } from "../../../domain/repositories/leaveRequestRepository"
import type { LeaveRequestProcessOperations } from "../../../domain/valueObjects/leaveRequest/leaveRequestProcessOperations"
import type { FilterLeaveRequestDto } from "../../dtos/leaveRequest/FilterLeaveRequestDto"
import type { CreateLeaveRequestDto, UpdateLeaveRequestDto } from "../../dtos/leaveRequest/leaveRequest"

export const createManageLeaveRequestUseCase = (repository: ILeaveRequestRepository) => {
  return {
        createLeaveRequset : (leaveRequest : CreateLeaveRequestDto) => repository.createLeaveRequest(leaveRequest),

        findAllEmployeeLeaveRequests : (filter : FilterLeaveRequestDto) => repository.getAllEmployeeLeaveRequests(filter),
        findAllMyLeaveRequests : (filter : FilterLeaveRequestDto) => repository.getAllMyLeaveRequests(filter),
        findLeaveRequestById : (id:number) => repository.getLeaveRequestById(id),

        updateLeaveRequest : (id:number , leaveRequest : UpdateLeaveRequestDto) => repository.updateLeaveRequest(id , leaveRequest),

        processleaveRequest : (id:number , operation : LeaveRequestProcessOperations ,reviewNotes:string ) => repository.processLeaveRequest(id,operation,reviewNotes)
  }
}
