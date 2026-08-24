import type { ApiClient } from "../../../../core/domain/common/api/ApiClient";
import {type EmployeeStatusLog } from "../../domain/entities/employeeStatus/employeeStatusLog";
import type { JobStatusLog } from "../../domain/entities/jobStatus/JobStatusLog";
import type { IEmployeeRepository } from "../../domain/repositories/EmployeeRepository";
import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import {type  EmployeeListItem } from "../../domain/entities/EmployeeListItem";

export const createEmployeeRepository = (apiClient: ApiClient): IEmployeeRepository => {
    return ({
        getEmployeeStatusLogs: (employeeId: number, params?: { page?: number; per_page?: number }) => {
            return apiClient.get<DomainResponse<EmployeeStatusLog[]>>(`/hr/employees/${employeeId}/employee-status-logs`, { params })
        },
        getJobStatusLogs: (employeeId: number, params?: { page?: number; per_page?: number }) => {
            return apiClient.get<DomainResponse<JobStatusLog[]>>(`/hr/employees/${employeeId}/job-status-logs`, { params })
        },
        getAllEmployees(filter : any) {
            return apiClient.get<DomainResponse<EmployeeListItem[]>>('/hr/employees' , {params:filter})
        },
    })
}