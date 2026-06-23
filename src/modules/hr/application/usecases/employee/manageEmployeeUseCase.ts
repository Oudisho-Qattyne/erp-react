import type { IEmployeeRepository } from "../../../domain/repositories/EmployeeRepository";
import type { FilterEmployeeDto } from "../../dtos/employee/FilterEmployeeDto";

export const createManageEmployeeUseCase = (repository : IEmployeeRepository) => {
    return({
        findEmployeeStatusLogs : (employeeId : number, params?: { page?: number; per_page?: number }) => repository.getEmployeeStatusLogs(employeeId, params),
        findJobStatusLogs : (employeeId : number, params?: { page?: number; per_page?: number }) => repository.getJobStatusLogs(employeeId, params),
        findAllEmployees:(filter : FilterEmployeeDto) => repository.getAllEmployees(filter)
    })
}