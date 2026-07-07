import { useMemo, useCallback, useState } from 'react';
import type { CreateEntityDTO, UpdateEntityDTO } from '../../../../modules/hr/application/dtos/entityDto';
import type { DomainResponse } from '../../../domain/common/responce/DomainResponse';
import { createCrufRepository } from '../../../infrastructure/repositories/CrudRepository';
import { createManageEntityUsecase } from '../../../application/usecases/manageEntityUseCase';
import type { EntityWithNameOnly } from '../../../domain/entities/EntityWithNameOnly';
import { useApiClient } from '../../context/api/ApiClinetProvider';

const OP_KEYS = ['getAll', 'getById', 'create', 'update', 'remove'] as const;

function initRecord<T>(value: T): Record<string, T> {
  return Object.fromEntries(OP_KEYS.map((k) => [k, value]));
}

export interface UseEntityCrudReturn<T> {
  // State
  entities: T[];
  loading: boolean;
  loadingMap: Record<string, boolean>;
  isLoading: () => boolean;
  error: string | null;
  errorMap: Record<string, string | null>;
  hasErrors: () => boolean;
  pagination?: DomainResponse<T>['pagination']; // optional
  
  // Actions — pass listUrlOverride when list endpoint differs from the default getUrl
  getAll: (listUrlOverride?: string) => Promise<DomainResponse<T[]>>;
  getById: (id: number) => Promise<DomainResponse<T> | null>;
  create: (data: CreateEntityDTO<T>) => Promise<DomainResponse<T>>;
  update: (id: number, data: UpdateEntityDTO<T>) => Promise<DomainResponse<T>>;
  remove: (id: number) => Promise<void>;
  
  // Helpers
  clearError: () => void;
}

export function useEntityCrud<T extends {id:number}>(getUrl:string , restUrl:string): UseEntityCrudReturn<T> {
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>(() => initRecord(false));
  const [errorMap, setErrorMap] = useState<Record<string, string | null>>(() => initRecord(null));
  const [entities, setEntities] = useState<T[]>([]);
  const [pagination, setPagination] = useState<DomainResponse<T>['pagination']>(); // optional
  const apiClient = useApiClient();

  const loading = Object.values(loadingMap).some(Boolean);
  const error = Object.values(errorMap).find((e) => e !== null) ?? null;

  const setFnLoading = (fn: string, v: boolean) => setLoadingMap((p) => ({ ...p, [fn]: v }));
  const setFnError = (fn: string, e: string | null) => setErrorMap((p) => ({ ...p, [fn]: e }));
  
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

  const clearError = useCallback(() => setErrorMap(initRecord(null)), []);

  const isLoading = useCallback(() => Object.values(loadingMap).some(Boolean), [loadingMap]);
  const hasErrors = useCallback(() => Object.values(errorMap).some((e) => e !== null), [errorMap]);

  const getAll = useCallback(async (listUrlOverride?: string) => {
    const effectiveListUrl = listUrlOverride ?? getUrl;
    if (!effectiveListUrl) {
      const msg = 'List URL is required (provide a parent id first)';
      setFnError('getAll', msg);
      throw new Error(msg);
    }

    setFnLoading('getAll', true);
    setFnError('getAll', null);
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
      setFnError('getAll', msg);
      throw err;
    } finally {
      setFnLoading('getAll', false);
    }
  }, [apiClient, getUrl, restUrl, usecase]);

  const getById = useCallback(async (id: number) => {
    setFnLoading('getById', true);
    setFnError('getById', null);
    try {
      const entity = await usecase.getById(id);
      return entity;
    } catch (err: any) {
      const msg = err.message || `Failed to fetch entities ${id}`;
      setFnError('getById', msg);
      throw err;
    } finally {
      setFnLoading('getById', false);
    }
  }, [usecase]);

  const create = useCallback(async (data: CreateEntityDTO<T>) => {
    setFnLoading('create', true);
    setFnError('create', null);
    try {
      const newEntity = await usecase.create(data);
      setEntities(prev => [...prev, newEntity.data]);
      return newEntity;
    } catch (err: any) {
      const msg = err.message || 'Failed to create entities';
      setFnError('create', msg);
      throw err;
    } finally {
      setFnLoading('create', false);
    }
  }, [usecase]);

  const update = useCallback(async (id: number, data: UpdateEntityDTO<T>) => {
    setFnLoading('update', true);
    setFnError('update', null);
    try {
      const updated = await usecase.update(id, data);
      setEntities(prev => prev.map(u => u.id === id ? updated.data : u));
      return updated;
    } catch (err: any) {
      const msg = err.message || `Failed to update entities ${id}`;
      setFnError('update', msg);
      throw err;
    } finally {
      setFnLoading('update', false);
    }
  }, [usecase]);

  const remove = useCallback(async (id: number) => {
    setFnLoading('remove', true);
    setFnError('remove', null);
    try {
      await usecase.delete(id);
      setEntities(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      const msg = err.message || `Failed to delete entities ${id}`;
      setFnError('remove', msg);
      throw err;
    } finally {
      setFnLoading('remove', false);
    }
  }, [usecase]);

  return {
    entities,
    loading,
    loadingMap,
    isLoading,
    error,
    errorMap,
    hasErrors,
    pagination,   // may be undefined
    getAll,
    getById,
    create,
    update,
    remove,
    clearError,
  };
}