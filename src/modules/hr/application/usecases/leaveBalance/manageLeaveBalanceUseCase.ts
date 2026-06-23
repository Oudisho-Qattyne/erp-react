import type { ILeaveBalanceRepository } from "../../../domain/repositories/leaveBalanceRepository"
import type { ILeaveTypeRepository } from "../../../domain/repositories/leaveRepository"
import type { FilterLeaveDto } from "../../dtos/leave/filterLeaveDto"
import type { CreateLeaveTypeDto, UpdateLeaveTypeDto } from "../../dtos/leave/LeaveTypeDto"
import type { AdjustLeaveBalanceDto } from "../../dtos/LeaveBalance/AdjustLeaveBalanceDto"
import type { FilterLeaveBalancesDto } from "../../dtos/LeaveBalance/FilterLeaveBalanceDto"

export const createManageLeaveBalanceUseCase = (repository: ILeaveBalanceRepository) => {
  return {
     findAllMyLeaveBalances(filter?: FilterLeaveBalancesDto) {
            return repository.findAllMyLeaveBalances(filter)
        },
        findAllEmployeeLeaveBalances(employeeId : number , filter : FilterLeaveBalancesDto) {
            return repository.findAllEmployeeLeaveBalances(employeeId , filter)
        },
        adjustLeaveBalance(adjust : AdjustLeaveBalanceDto) {
            return repository.adjustLeaveBalance(adjust)
        },
  }
}
