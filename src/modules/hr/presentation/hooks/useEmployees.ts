import { useState, useCallback, useMemo } from 'react';
import type { EmployeeData } from '../../domain/entities/employee';
import type { CreateEmployeeDTO, UpdateEmployeeDTO } from '../../application/dtos/employeeDto';
import { useApiClient } from '../../../../core/presentation/context/api/ApiClinetProvider';
import { createManageEmployeeUseCase } from '../../application/usecases/manageEmployeeUseCase';
import { createEmployeeRepository } from '../../infrastructure/repositories';

export interface UseManageEmployeeReturn {
  // State
  employees: EmployeeData[];
  loading: boolean;
  error: string | null;
  // CRUD actions
  getAll: () => Promise<EmployeeData[]>;
  getById: (id: number) => Promise<EmployeeData | null>;
  create: (data: CreateEmployeeDTO) => Promise<EmployeeData>;
  update: (id: number, data: UpdateEmployeeDTO) => Promise<EmployeeData>;
  remove: (id: number) => Promise<void>;
  // Helpers
  clearError: () => void;
  reset: () => void;
}

export function useManageEmployee(): UseManageEmployeeReturn {
  const apiClient = useApiClient();
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create repository and use case once
  const repository = useMemo(() => createEmployeeRepository(apiClient), [apiClient]);
  const usecase = useMemo(() => createManageEmployeeUseCase(repository), [repository]);

  const clearError = useCallback(() => setError(null), []);

  const handleAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    onSuccess?: (result: T) => void
  ): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const result = await operation();
      onSuccess?.(result);
      return result;
    } catch (err: any) {
      const message = err.message || 'An unexpected error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAll = useCallback(async (): Promise<EmployeeData[]> => {
    return handleAsync(async () => {
      const response = await usecase.getAll();
      const data = response.data;
      setEmployees(data);
      return data;
    });
  }, [usecase, handleAsync]);

  const getById = useCallback(async (id: number): Promise<EmployeeData | null> => {
    return handleAsync(async () => {
      return await usecase.getById(id);
    });
  }, [usecase, handleAsync]);

  const create = useCallback(async (data: CreateEmployeeDTO): Promise<EmployeeData> => {
    return handleAsync(async () => {
      const newEmployee = await usecase.create(data);
      setEmployees(prev => [...prev, newEmployee]);
      return newEmployee;
    });
  }, [usecase, handleAsync]);

  const update = useCallback(async (id: number, data: UpdateEmployeeDTO): Promise<EmployeeData> => {
    return handleAsync(async () => {
      const updated = await usecase.update(id, data);
      setEmployees(prev => prev.map(emp => emp.id === id ? updated : emp));
      return updated;
    });
  }, [usecase, handleAsync]);

  const remove = useCallback(async (id: number): Promise<void> => {
    await handleAsync(async () => {
      await usecase.delete(id);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    });
  }, [usecase, handleAsync]);

  const reset = useCallback(() => {
    setEmployees([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    employees,
    loading,
    error,
    getAll,
    getById,
    create,
    update,
    remove,
    clearError,
    reset,
  };
}