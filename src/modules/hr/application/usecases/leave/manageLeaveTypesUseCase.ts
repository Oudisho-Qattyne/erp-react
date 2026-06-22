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
    createLeaveType: (data: CreateLeaveTypeDto) => {
      return repository.createLeaveType(data)
    },
    updateLeaveType: (id: number, data: UpdateLeaveTypeDto) => {
      return repository.updateLeaveType(id, data)
    },
    archiveLeaveType: (id: number) => {
      return repository.archiveLeaveType(id)
    },
    deleteLeaveType: (id: number) => {
      return repository.deleteLeaveType(id)
    },
    findUserEligibleLeaveTypes: () => {
      return repository.getUserEligibleLeaveTypes()
    }
  }
}
