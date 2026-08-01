// src/modules/hr/presentation/hooks/useManageEmployee.ts
import { useState, useCallback, useEffect, useMemo } from 'react';
import type { EmployeeData } from '../../domain/entities/employee';
import type { CreateEmployeeDTO, UpdateEmployeeDTO } from '../../application/dtos/employeeDto';
import type { EmployeeListItem } from '../../domain/entities/EmployeeListItem';
import type { DomainResponse } from '../../../../core/domain/common/responce/DomainResponse';
import { useApiClient } from '../../../../core/presentation/context/api/ApiClinetProvider';
import { createManageEmployeeUseCase } from '../../application/usecases/manageEmployeeUseCase';
import { createEmployeeRepository } from '../../infrastructure/repositories';
import { useIdempotency } from '../../../../core/presentation/hooks/useIdempotency';

export interface UseManageEmployeeParams {
  initialPage?: number;
  initialPerPage?: number;
  initialSearch?: string;
  initialGender?: string;
  initialSortBy?: string;
  initialSortOrder?: 'asc' | 'desc';
}

export interface UseManageEmployeeReturn {
  // List state (paginated)
  employees: EmployeeListItem[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    lastPage: number;
    total: number;
    hasMore: boolean;
  };
  // Filters / pagination controls
  search: string;
  gender: string;
  page: number;
  perPage: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  extraFilters: Record<string, any>;
  setSearch: (val: string) => void;
  setGender: (val: string) => void;
  setPage: (page: number) => void;
  setPerPage: (size: number) => void;
  setSortBy: (key: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setExtraFilters: (patch: Record<string, any>) => void;
  resetFilters: () => void;
  refetch: () => Promise<void>;
  // Single entity CRUD (using repository / usecase)
  getById: (id: number) => Promise<DomainResponse<EmployeeData> | null>;
  create: (data: CreateEmployeeDTO) => Promise<DomainResponse<EmployeeData>>;
  update: (id: number, data: UpdateEmployeeDTO) => Promise<DomainResponse<EmployeeData>>;
  remove: (id: number) => Promise<void>;
  clearError: () => void;
}

export function useManageEmployee(params: UseManageEmployeeParams = {}): UseManageEmployeeReturn {
  const {
    initialPage = 1,
    initialPerPage = 10,
    initialSearch = '',
    initialGender = '',
    initialSortBy = '',
    initialSortOrder = 'desc',
  } = params;

  const apiClient = useApiClient();
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    lastPage: 1,
    total: 0,
    hasMore: false,
  });
  const [search, setSearch] = useState(initialSearch);
  const [gender, setGender] = useState(initialGender);
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);
  const [extraFilters, setExtraFilters] = useState<Record<string, any>>({});

  // Prepare CRUD (repository + usecase) for single entity operations
  const repository = useMemo(() => createEmployeeRepository(apiClient), [apiClient]);
  const usecase = useMemo(() => createManageEmployeeUseCase(repository), [repository]);
  const idem = useIdempotency();

  // Fetch paginated list
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        page,
        per_page: perPage,
      };
      if (search.trim()) params.search = search.trim();
      if (gender) params.gender = gender;
      if (sortBy) {
        params.sort_by = { [sortBy]: sortOrder };
      }
      for (const [key, val] of Object.entries(extraFilters)) {
        if (val !== undefined && val !== null && val !== '') params[key] = val;
      }
      const response = await apiClient.get<DomainResponse<EmployeeListItem[]>>('/hr/employees', { params });
      setEmployees(response.data);
      if (response.pagination) {
        setPagination({
          currentPage: response.pagination.currentPage ?? page,
          lastPage: response.pagination.lastPage ?? 1,
          total: response.pagination.total ?? 0,
          hasMore: response.pagination.hasMore ?? false,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, [apiClient, page, perPage, search, gender, sortBy, sortOrder, extraFilters]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const resetFilters = useCallback(() => {
    setSearch('');
    setGender('');
    setPage(1);
    setSortBy('');
    setSortOrder('desc');
    setExtraFilters({});
  }, []);

  const refetch = useCallback(async () => {
    await fetchEmployees();
  }, [fetchEmployees]);

  // Single entity CRUD methods (mostly reuse the usecase)
  const getById = useCallback(async (id: number) => {
    return usecase.getById(id);
  }, [usecase]);

  const create = useCallback(async (data: CreateEmployeeDTO) => {
    const key = idem.getKey('createEmployee', data);
    try {
      const newEmployee = await usecase.create(data, key);
      idem.onSettled(undefined, key);
      // Optionally refresh list to include new employee
      await fetchEmployees();
      return newEmployee;
    } catch (err) {
      idem.onSettled(err, key);
      throw err;
    }
  }, [usecase, fetchEmployees, idem]);

  const update = useCallback(async (id: number, data: UpdateEmployeeDTO) => {
    const key = idem.getKey('updateEmployee', { id, data });
    try {
      const updated = await usecase.update(id, data, key);
      idem.onSettled(undefined, key);
      // Update list optimistically or refetch
      setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...updated } : emp));
      return updated;
    } catch (err) {
      idem.onSettled(err, key);
      throw err;
    }
  }, [usecase, idem]);

  const remove = useCallback(async (id: number) => {
    await usecase.delete(id);
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    // Optionally refetch to update pagination counts
    await fetchEmployees();
  }, [usecase, fetchEmployees]);

  const clearError = useCallback(() => setError(null), []);

  return {
    employees,
    loading,
    error,
    pagination,
    search,
    gender,
    page,
    perPage,
    sortBy,
    sortOrder,
    extraFilters,
    setSearch,
    setGender,
    setPage,
    setPerPage,
    setSortBy,
    setSortOrder,
    setExtraFilters,
    resetFilters,
    refetch,
    getById,
    create,
    update,
    remove,
    clearError,
  };
}