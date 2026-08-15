import type { ApiClient } from "../../../../core/domain/common/api/ApiClient";
import {type DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { EntityWithNameOnly } from "../../../../core/domain/entities/EntityWithNameOnly";
import { type Leave } from "../../domain/entities/leave/leave";
import type { ILeaveTypeRepository } from "../../domain/repositories/leaveRepository";

export const createLeaveTypeRepository = (apiClient: ApiClient): ILeaveTypeRepository => {
  const baseUrl = '/hr/leave-types';

  return {
    findAllLeaveTypes: (filter?: any) => {
      return apiClient.get<DomainResponse<EntityWithNameOnly[]>>(baseUrl, { params: filter });
    },
    findLeaveTypeById: (id: number) => {
      return apiClient.get<DomainResponse<Leave>>(`${baseUrl}/${id}`)
    },
    createLeaveType(data: any, idempotencyKey?: string) {
      return apiClient.post<DomainResponse<Leave>>(baseUrl, data, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined)
    },
    updateLeaveType(id: number, data: any, idempotencyKey?: string) {
      return apiClient.put<DomainResponse<Leave>>(`${baseUrl}/${id}`, data, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined)
    },
    archiveLeaveType(id: number, idempotencyKey?: string) {
      return apiClient.patch<DomainResponse<Leave>>(`${baseUrl}/${id}/archive`, undefined, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined)
    },
    deleteLeaveType(id: number) {
      return apiClient.delete<DomainResponse<Leave>> (`${baseUrl}/${id}`)
    },
    getUserEligibleLeaveTypes() {
      return apiClient.get<DomainResponse<EntityWithNameOnly[]>>(`/hr/employees/eligible-leave-types/my`)
    }
  };
};


// The eligibility_rules.conditions.0 has an invalid field \"employment_type\". Allowed: employee_age, employee_gender, employee_number_of_children, employee_years_of_service, employee_marital_status, employee_job_title, employee_contract_type."