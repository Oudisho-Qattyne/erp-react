import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { EmployeeListItem } from "../entities/EmployeeListItem";
import type { EmployeeStatusLog } from "../entities/employeeStatus/employeeStatusLog";
import type { JobStatusLog } from "../entities/jobStatus/JobStatusLog";

export interface IEmployeeRepository{
    getAllEmployees : (filter : any ) => Promise<DomainResponse<EmployeeListItem[]>>
    getEmployeeStatusLogs : (employeeId: number, params?: { page?: number; per_page?: number }) => Promise<DomainResponse<EmployeeStatusLog[]>>
    getJobStatusLogs : (employeeId: number, params?: { page?: number; per_page?: number }) => Promise<DomainResponse<JobStatusLog[]>>
}