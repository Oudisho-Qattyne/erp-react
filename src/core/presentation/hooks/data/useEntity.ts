import { useMemo, useCallback, useState } from 'react';
import type { CreateEntityDTO, UpdateEntityDTO } from '../../../../modules/hr/application/dtos/entityDto';
import type { DpomainResponsePaginated } from '../../../../modules/hr/domain/entities/common/DomainResponsePaginated';
import { createCrufRepository } from '../../../infrastructure/repositories/CrudRepository';
import { createManageEntityUsecase } from '../../../application/usecases/manageEntityUseCase';
import type { EntityWithNameOnly } from '../../../domain/entities/EntityWithNameOnly';
import { useApiClient } from '../../context/api/ApiClinetProvider';
import { useIdempotency } from '../useIdempotency';
import { handleApiError } from '../../utils/handleApiError';

const OP_KEYS = ['getAll', 'getById', 'create', 'update', 'remove'] as const;

function initRecord<T>(value: T): Record<string, T> {
  return Object.fromEntries(OP_KEYS.map((k) => [k, value]));
}

export interface QueryParams {
  page?: number;
  perPage?: number;
  search?: string;
  sort?: string;
  filter?: Record<string, string | boolean | number>;
}

function buildFlatParams(params: QueryParams): Record<string, string | boolean | number> {
  const flat: Record<string, string | boolean | number> = {};
  if (params.page != null) flat.page = params.page;
  if (params.perPage != null) flat.perPage = params.perPage;
  if (params.search != null) flat.search = params.search;
  if (params.sort != null) flat.sort = params.sort;
  if (params.filter) {
    for (const [key, value] of Object.entries(params.filter)) {
      flat[`filter[${key}]`] = value;
    }
  }
  return flat;
}

interface PaginationInfo {
  lastPage: number;
  currentPage: number;
  hasMore: boolean;
  total: number;
}

function extractPagination(res: DpomainResponsePaginated<unknown>): PaginationInfo | undefined {
  if (res.lastPage == null) return undefined;
  return {
    lastPage: res.lastPage,
    currentPage: res.currentPage ?? 1,
    hasMore: res.hasMore ?? false,
    total: Number((res as any).total ?? 0),
  };
}

export interface UseEntityCrudReturn<T> {
  entities: T[];
  loading: boolean;
  loadingMap: Record<string, boolean>;
  isLoading: () => boolean;
  error: string | null;
  errorMap: Record<string, string | null>;
  hasErrors: () => boolean;
  pagination?: PaginationInfo;
  
  getAll: (listUrlOverride?: string, params?: QueryParams) => Promise<DpomainResponsePaginated<T[]>>;
  getById: (id: number) => Promise<DpomainResponsePaginated<T> | null>;
  create: (data: CreateEntityDTO<T>) => Promise<DpomainResponsePaginated<T>>;
  update: (id: number, data: UpdateEntityDTO<T>) => Promise<DpomainResponsePaginated<T>>;
  remove: (id: number) => Promise<void>;
  
  clearError: () => void;
}

export function useEntityCrud<T extends {id:number}>(getUrl:string , restUrl:string): UseEntityCrudReturn<T> {
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>(() => initRecord(false));
  const [errorMap, setErrorMap] = useState<Record<string, string | null>>(() => initRecord(null));
  const [entities, setEntities] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>();
  const apiClient = useApiClient();
  const idem = useIdempotency();

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

  const getAll = useCallback(async (listUrlOverride?: string, params?: QueryParams) => {
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

      const flatParams = params ? buildFlatParams(params) : undefined;
      const response = await activeUsecase.getAll(flatParams);
      setEntities(response.data);
      setPagination(extractPagination(response));
      return response;
    } catch (err: any) {
      setFnError('getAll', handleApiError(err, { silent: true }));
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
      setFnError('getById', handleApiError(err, { silent: true }));
      throw err;
    } finally {
      setFnLoading('getById', false);
    }
  }, [usecase]);

  const create = useCallback(async (data: CreateEntityDTO<T>) => {
    setFnLoading('create', true);
    setFnError('create', null);
    try {
      const newEntity = await idem.run('create', data, (key) => usecase.create(data, key));
      setEntities(prev => [...prev, newEntity.data]);
      return newEntity;
    } catch (err: any) {
      setFnError('create', handleApiError(err, { silent: true }));
      throw err;
    } finally {
      setFnLoading('create', false);
    }
  }, [usecase, idem]);

  const update = useCallback(async (id: number, data: UpdateEntityDTO<T>) => {
    setFnLoading('update', true);
    setFnError('update', null);
    try {
      const updated = await idem.run('update', { id, data }, (key) => usecase.update(id, data, key));
      setEntities(prev => prev.map(u => u.id === id ? updated.data : u));
      return updated;
    } catch (err: any) {
      setFnError('update', handleApiError(err, { silent: true }));
      throw err;
    } finally {
      setFnLoading('update', false);
    }
  }, [usecase, idem]);

  const remove = useCallback(async (id: number) => {
    setFnLoading('remove', true);
    setFnError('remove', null);
    try {
      await usecase.delete(id);
      setEntities(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      setFnError('remove', handleApiError(err, { silent: true }));
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
    pagination,
    getAll,
    getById,
    create,
    update,
    remove,
    clearError,
  };
}
