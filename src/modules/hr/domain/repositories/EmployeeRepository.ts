import type { DpomainResponsePaginated } from "../entities/common/DomainResponsePaginated";
import type { EmployeeListItem } from "../entities/EmployeeListItem";
import type { EmployeeStatusLog } from "../entities/employeeStatus/employeeStatusLog";
import type { JobStatusLog } from "../entities/jobStatus/JobStatusLog";

export interface IEmployeeRepository{
    getAllEmployees : (filter : any ) => Promise<DpomainResponsePaginated<EmployeeListItem[]>>
    getEmployeeStatusLogs : (employeeId: number, params?: { page?: number; per_page?: number }) => Promise<DpomainResponsePaginated<EmployeeStatusLog[]>>
    getJobStatusLogs : (employeeId: number, params?: { page?: number; per_page?: number }) => Promise<DpomainResponsePaginated<JobStatusLog[]>>
}