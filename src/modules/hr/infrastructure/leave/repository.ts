import type { ApiClient } from "../../../../core/domain/common/api/ApiClient";
import type { EntityWithNameOnly } from "../../../../core/domain/entities/EntityWithNameOnly";
import {type DpomainResponsePaginated } from "../../domain/entities/common/DomainResponsePaginated";
import { type Leave } from "../../domain/entities/leave/leave";
import type { ILeaveTypeRepository } from "../../domain/repositories/leaveRepository";

export const createLeaveTypeRepository = (apiClient: ApiClient): ILeaveTypeRepository => {
  const baseUrl = '/hr/leave-types';

  return {
    findAllLeaveTypes: (filter?: any) => {
      return apiClient.get<DpomainResponsePaginated<EntityWithNameOnly[]>>(baseUrl, { params: filter });
    },
    findLeaveTypeById: (id: number) => {
      return apiClient.get<DpomainResponsePaginated<Leave>>(`${baseUrl}/${id}`)
    },
    createLeaveType(data: any) {
      return apiClient.post<DpomainResponsePaginated<Leave>>(baseUrl, data)
    },
    updateLeaveType(id: number, data: any) {
      return apiClient.put<DpomainResponsePaginated<Leave>>(`${baseUrl}/${id}`, data)
    },
    archiveLeaveType(id: number) {
      return apiClient.patch<DpomainResponsePaginated<Leave>>(`${baseUrl}/${id}/archive`)
    },
    deleteLeaveType(id: number) {
      return apiClient.delete<DpomainResponsePaginated<Leave>> (`${baseUrl}/${id}`)
    },
  };
};


// The eligibility_rules.conditions.0 has an invalid field \"employment_type\". Allowed: employee_age, employee_gender, employee_number_of_children, employee_years_of_service, employee_marital_status, employee_job_title, employee_contract_type."