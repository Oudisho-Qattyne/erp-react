import type { DomainResponse } from '../../../../core/domain/common/responce/DomainResponse';
import type { ICrudRepository } from '../../../../core/domain/repositories/ICrudRepository';
import { createManageEntityUsecase } from '../../../../core/application/usecases/manageEntityUseCase';
import type { EmployeeData } from '../../domain/entities/employee';
import type { CreateEmployeeDTO, UpdateEmployeeDTO } from '../dtos/employeeDto';

/**
 * Factory that creates a complete use case for managing employees.
 * It wraps the generic use case with the employee repository and optional validation.
 */
export const createManageEmployeeUseCase = (
  repository: ICrudRepository<EmployeeData, CreateEmployeeDTO, UpdateEmployeeDTO, number>
) => {
  // Reuse the generic use case factory
  const baseUsecase = createManageEntityUsecase<
    EmployeeData,
    CreateEmployeeDTO,
    UpdateEmployeeDTO,
    number
  >(
    repository
    );

  // You can extend or override methods here if needed
  return {
    ...baseUsecase,

    // Example: add a custom method that is not in the generic interface
    async getByInternalId(personal_id_number: string): Promise<EmployeeData | null> {
      const { data } = await baseUsecase.getAll();
      return data.find(emp => emp.personal_id_number === personal_id_number) || null;
    },
  };
};