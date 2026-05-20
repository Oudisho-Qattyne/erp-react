import type { ApiClient } from "../../../core/domain/common/api/ApiClient";
import { createCrufRepository } from "../../../core/infrastructure/repositories/CrudRepository";
import type { CreateEmployeeDTO, UpdateEmployeeDTO } from "../application/dtos/employeeDto";
import type { EmployeeData } from "../domain/entities/employee";

/**
 * Factory function to create an employee CRUD repository.
 * Uses the generic createCrufRepository with employee-specific types and endpoints.
 *
 * @param apiClient - The configured API client (e.g., from ApiClientProvider)
 * @returns An object implementing ICrudRepository<Employee, CreateEmployeeDTO, UpdateEmployeeDTO, number>
 */
export const createEmployeeRepository = (apiClient: ApiClient) => {
  // Base URL for all employee-related endpoints (no trailing slash)
  const baseUrl = '/hr/employees';

  return createCrufRepository<
    EmployeeData,
    CreateEmployeeDTO,
    UpdateEmployeeDTO,
    number
  >(
    apiClient,
    baseUrl,      // URL for findAll (list)   → GET /employees
    baseUrl       // URL for findById, create, update, delete → /employees/:id
  );
};