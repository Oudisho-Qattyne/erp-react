import type { ILeaveTypeRepository } from "../../../domain/repositories/leaveRepository"
import type { FilterLeaveDto } from "../../dtos/leave/filterLeaveDto"
import type { CreateLeaveTypeDto, UpdateLeaveTypeDto } from "../../dtos/leave/LeaveTypeDto"

export const createManageLeaveTypesUseCase = (repository: ILeaveTypeRepository) => {
  return {
    findAllLeaveTypes: (filter: FilterLeaveDto) => {
      return repository.findAllLeaveTypes(filter)
    },
    findLeaveTypeById: (id: number) => {
      return repository.findLeaveTypeById(id)
    },
    createLeaveType: (data: CreateLeaveTypeDto, idempotencyKey?: string) => {
      return repository.createLeaveType(data, idempotencyKey)
    },
    updateLeaveType: (id: number, data: UpdateLeaveTypeDto, idempotencyKey?: string) => {
      return repository.updateLeaveType(id, data, idempotencyKey)
    },
    archiveLeaveType: (id: number, idempotencyKey?: string) => {
      return repository.archiveLeaveType(id, idempotencyKey)
    },
    deleteLeaveType: (id: number) => {
      return repository.deleteLeaveType(id)
    },
    findUserEligibleLeaveTypes: (filter?: { page?: number; per_page?: number }) => {
      return repository.getUserEligibleLeaveTypes(filter)
    }
  }
}
