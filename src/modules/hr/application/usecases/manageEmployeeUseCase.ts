import type { DomainResponse } from '../../../../core/domain/common/responce/DomainResponse';
import type { ICrudRepository } from '../../../../core/domain/repositories/ICrudRepository';
import { createManageEntityUsecase } from '../../../../core/application/usecases/manageEntityUseCase';
import type { EmployeeData } from '../../domain/entities/employee';
import type { CreateEmployeeDTO, UpdateEmployeeDTO } from '../dtos/employeeDto';
import { createEmployeeValidator } from '../validators/employeeValidator';

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
    repository,
    createEmployeeValidator // optional: runs before create/update
  );

  // You can extend or override methods here if needed
  return {
    ...baseUsecase,

    // Example: add a custom method that is not in the generic interface
    async getByInternalId(internalId: string): Promise<EmployeeData | null> {
      try {
        // This would require a custom repository method; for now we rely on findAll and filter
        const { data } = await baseUsecase.getAll();
        return data.find(emp => emp.internal_id === internalId) || null;
      } catch (error: any) {
        throw new Error(`Failed to fetch employee by internal ID: ${error.message}`);
      }
    },
  };
};