import { useMemo, useCallback, useState } from 'react';
import type { CreateEntityDTO, UpdateEntityDTO } from '../../../../modules/hr/application/dtos/entityDto';
import type { DomainResponse } from '../../../domain/common/responce/DomainResponse';
import { createCrufRepository } from '../../../infrastructure/repositories/CrudRepository';
import { createManageEntityUsecase } from '../../../application/usecases/manageEntityUseCase';
import type { EntityWithNameOnly } from '../../../domain/entities/EntityWithNameOnly';
import { useApiClient } from '../../context/api/ApiClinetProvider';

export interface UseEntityCrudReturn<T> {
  // State
  entities: T[];
  loading: boolean;
  error: string | null;
  pagination?: DomainResponse<T>['pagination']; // optional
  
  // Actions — pass listUrlOverride when list endpoint differs from the default getUrl
  getAll: (listUrlOverride?: string) => Promise<DomainResponse<T>>;
  getById: (id: number) => Promise<T | null>;
  create: (data: CreateEntityDTO<T>) => Promise<T>;
  update: (id: number, data: UpdateEntityDTO<T>) => Promise<T>;
  remove: (id: number) => Promise<void>;
  
  // Helpers
  clearError: () => void;
}

export function useEntityCrud<T extends EntityWithNameOnly>(getUrl:string , restUrl:string): UseEntityCrudReturn<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entities, setEntities] = useState<T[]>([]);
  const [pagination, setPagination] = useState<DomainResponse<T>['pagination']>(); // optional
  const apiClient = useApiClient();
  
  const repository = useMemo(
    () => createCrufRepository<T, CreateEntityDTO<T>, UpdateEntityDTO<T>, number>(
      apiClient,
      getUrl,
      restUrl
    ),
    [apiClient, getUrl, restUrl]
  );
  const usecase = useMemo(
    () => createManageEntityUsecase<T, CreateEntityDTO<T>, UpdateEntityDTO<T>>(
      repository
    ),
    [repository]
  );

  const clearError = useCallback(() => setError(null), []);

  const getAll = useCallback(async (listUrlOverride?: string) => {
    const effectiveListUrl = listUrlOverride ?? getUrl;
    if (!effectiveListUrl) {
      const msg = 'List URL is required (provide a parent id first)';
      setError(msg);
      throw new Error(msg);
    }

    setLoading(true);
    setError(null);
    try {
      const activeUsecase =
        listUrlOverride != null
          ? createManageEntityUsecase(
              createCrufRepository<T, CreateEntityDTO<T>, UpdateEntityDTO<T>, number>(
                apiClient,
                listUrlOverride,
                restUrl
              )
            )
          : usecase;

      const response = await activeUsecase.getAll();

      setEntities(response.data);
      setPagination(response.pagination);
      return response;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to fetch entities';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiClient, getUrl, restUrl, usecase]);

  const getById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const entity = await usecase.getById(id);
      return entity;
    } catch (err: any) {
      const msg = err.message || `Failed to fetch entities ${id}`;
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [usecase]);

  const create = useCallback(async (data: CreateEntityDTO<T>) => {
    setLoading(true);
    setError(null);
    try {
      const newEntity = await usecase.create(data);
      setEntities(prev => [...prev, newEntity]);
      return newEntity;
    } catch (err: any) {
      const msg = err.message || 'Failed to create entities';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [usecase]);

  const update = useCallback(async (id: number, data: UpdateEntityDTO<T>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await usecase.update(id, data);
      setEntities(prev => prev.map(u => u.id === id ? updated : u));
      return updated;
    } catch (err: any) {
      const msg = err.message || `Failed to update entities ${id}`;
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
      setEntities(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      const msg = err.message || `Failed to delete entities ${id}`;
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [usecase]);

  return {
    entities,
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