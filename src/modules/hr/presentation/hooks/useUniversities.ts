import { useMemo, useCallback, useState } from 'react';
import type { University } from '../../../../core/domain/entities/education/University';
import type { DomainResponse } from '../../../../core/domain/common/responce/DomainResponse';
import { createFetchApiClient } from '../../../../core/infrastructure/api/fetchApiClient';
import { createCrufRepository } from '../../../../core/infrastructure/repositories/CrudRepository';
import { createManageEntityUsecase } from '../../../../core/application/usecases/manageEntityUseCase';
import type { CreateUniversityDTO, UpdateUniversityDTO } from '../../application/dtos/university';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface UseUniversityCrudReturn {
  // State
  universities: University[];
  loading: boolean;
  error: string | null;
  pagination?: DomainResponse<University>['pagination']; // optional
  
  // Actions
  getAll: () => Promise<DomainResponse<University>>;
  getById: (id: number) => Promise<University | null>;
  create: (data: CreateUniversityDTO) => Promise<University>;
  update: (id: number, data: UpdateUniversityDTO) => Promise<University>;
  remove: (id: number) => Promise<void>;
  
  // Helpers
  clearError: () => void;
}

export function useUniversityCrud(): UseUniversityCrudReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [pagination, setPagination] = useState<DomainResponse<University>['pagination']>(); // optional

  const apiClient = useMemo(() => createFetchApiClient(API_BASE_URL), []);
  const repository = useMemo(
    () => createCrufRepository<University, CreateUniversityDTO, UpdateUniversityDTO, number>(
      apiClient,
      '/universities'
    ),
    [apiClient]
  );
  const usecase = useMemo(
    () => createManageEntityUsecase<University, CreateUniversityDTO, UpdateUniversityDTO>(
      repository
    ),
    [repository]
  );

  const clearError = useCallback(() => setError(null), []);

  const getAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await usecase.getAll();
      setUniversities(response.data);
      // Only set pagination if it exists
      setPagination(response.pagination);
      return response;
    } catch (err: any) {
      const msg = err.message || 'Failed to fetch universities';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [usecase]);

  const getById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const entity = await usecase.getById(id);
      return entity;
    } catch (err: any) {
      const msg = err.message || `Failed to fetch university ${id}`;
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [usecase]);

  const create = useCallback(async (data: CreateUniversityDTO) => {
    setLoading(true);
    setError(null);
    try {
      const newEntity = await usecase.create(data);
      setUniversities(prev => [...prev, newEntity]);
      return newEntity;
    } catch (err: any) {
      const msg = err.message || 'Failed to create university';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [usecase]);

  const update = useCallback(async (id: number, data: UpdateUniversityDTO) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await usecase.update(id, data);
      setUniversities(prev => prev.map(u => u.id === id ? updated : u));
      return updated;
    } catch (err: any) {
      const msg = err.message || `Failed to update university ${id}`;
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [usecase]);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await usecase.delete(id);
      setUniversities(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      const msg = err.message || `Failed to delete university ${id}`;
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [usecase]);

  return {
    universities,
    loading,
    error,
    pagination,   // may be undefined
    getAll,
    getById,
    create,
    update,
    remove,
    clearError,
  };
}