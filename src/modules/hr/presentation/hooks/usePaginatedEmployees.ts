// src/modules/hr/presentation/hooks/usePaginatedEmployees.ts
import { useState, useEffect, useCallback } from 'react';
import type { EmployeeListItem } from '../../domain/entities/EmployeeListItem'; // define this interface
import { useApiClient } from '../../../../core/presentation/context/api/ApiClinetProvider';
import type { DomainResponse } from '../../../../core/domain/common/responce/DomainResponse';

interface UsePaginatedEmployeesParams {
  initialPage?: number;
  initialPerPage?: number;
  initialSearch?: string;
  initialGender?: string;
}

export function usePaginatedEmployees({
  initialPage = 1,
  initialPerPage = 10,
  initialSearch = '',
  initialGender = '',
}: UsePaginatedEmployeesParams = {}) {
  const apiClient = useApiClient();
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<DomainResponse<EmployeeListItem>['pagination']>({
    currentPage: initialPage,
    lastPage: 1,
    total: 0,
    hasMore: false,
  });
  const [search, setSearch] = useState(initialSearch);
  const [gender, setGender] = useState(initialGender);
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  
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

      const response = await apiClient.get<DomainResponse<EmployeeListItem[]>>('hr/employees', {
        params,
      });
      setEmployees(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, [apiClient, page, perPage, search, gender]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= (pagination?.lastPage || 1)) {
      setPage(newPage);
    }
  };

  const changePerPage = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1); // reset to first page when items per page changes
  };

  const resetFilters = () => {
    setSearch('');
    setGender('');
    setPage(1);
  };

  return {
    employees,
    loading,
    error,
    pagination,
    search,
    gender,
    page,
    perPage,
    setSearch,
    setGender,
    changePage,
    changePerPage,
    resetFilters,
    refetch: fetchEmployees,
  };
}