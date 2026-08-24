import { useMemo, useCallback, useState, useEffect } from 'react';
import type { CreateEntityDTO, UpdateEntityDTO } from '../../../../modules/hr/application/dtos/entityDto';
import type { DomainResponse } from '../../../domain/common/responce/DomainResponse';
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
  /** Emits `sort_by[<name>]=<order>` per the lookups API (e.g. sort_by[name]) */
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  /** Emits flat boolean params (e.g. is_active=true) for lookups that support them */
  isActive?: boolean;
  isDefault?: boolean;
}

function buildFlatParams(params: QueryParams): Record<string, string | boolean | number> {
  const flat: Record<string, string | boolean | number> = {};
  if (params.page != null) flat.page = params.page;
  if (params.perPage != null) flat.perPage = params.perPage;
  if (params.search != null) flat.search = params.search;
  if (params.sortBy != null) flat[`sort_by[${params.sortBy}]`] = params.sortOrder ?? 'asc';
  if (params.isActive != null) flat.is_active = params.isActive;
  if (params.isDefault != null) flat.is_default = params.isDefault;
  return flat;
}

export interface ListStateFilter {
  search?: string;
  sortColumn?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | boolean | number | (string | number | boolean)[] | undefined;
}

export interface EntityListState {
  filter: ListStateFilter;
  setFilter: (patch: Partial<ListStateFilter> | ((prev: ListStateFilter) => ListStateFilter)) => void;
  setSearch: (query: string) => void;
  setSort: (column: string) => void;
  resetFilter: () => void;
  refresh: () => void;
  page: number;
  perPage: number;
  setPage: (page: number) => void;
  setPerPage: (size: number) => void;
}

export interface UseEntityCrudOptions {
  listState?: boolean;
  defaultPerPage?: number;
  searchParamName?: string;
  /** Column used as the initial sort (e.g. 'name' for lookups). Omit for no initial sort. */
  defaultSortColumn?: string;
  defaultSortOrder?: 'asc' | 'desc';
  /** Initial filter applied to the list (e.g. { status: 'active' }). `resetFilter` returns to this. */
  defaultFilter?: ListStateFilter;
  /** Send page/per_page query params. Default true. Set false for lookup-style lists. */
  paginate?: boolean;
  /** Debounce list refetches (ms). Default 0 (immediate). */
  debounceMs?: number;
}

interface PaginationInfo {
  lastPage: number;
  currentPage: number;
  hasMore: boolean;
  total: number;
}

function extractPagination(res: DomainResponse<unknown>): PaginationInfo | undefined {
  const p = res.pagination;
  if (p == null || p.lastPage == null) return undefined;
  return {
    lastPage: p.lastPage,
    currentPage: p.currentPage ?? 1,
    hasMore: p.hasMore ?? false,
    total: Number(p.total ?? 0),
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
  
  getAll: (listUrlOverride?: string, params?: QueryParams) => Promise<DomainResponse<T[]>>;
  getById: (id: number) => Promise<DomainResponse<T> | null>;
  create: (data: CreateEntityDTO<T>) => Promise<DomainResponse<T>>;
  update: (id: number, data: UpdateEntityDTO<T>) => Promise<DomainResponse<T>>;
  remove: (id: number) => Promise<void>;
  
  clearError: () => void;
}

export interface UseEntityCrudWithListStateReturn<T> extends UseEntityCrudReturn<T> {
  list: EntityListState;
}

export function useEntityCrud<T extends { id: number }>(
  getUrl: string,
  restUrl: string,
  options: { listState: true } & Omit<UseEntityCrudOptions, 'listState'>
): UseEntityCrudWithListStateReturn<T>;
export function useEntityCrud<T extends { id: number }>(
  getUrl: string,
  restUrl: string,
  options?: UseEntityCrudOptions
): UseEntityCrudReturn<T>;
export function useEntityCrud<T extends { id: number }>(
  getUrl: string,
  restUrl: string,
  options?: UseEntityCrudOptions
): UseEntityCrudReturn<T> {
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

  const listStateEnabled = options?.listState ?? false;
  const searchParamName = options?.searchParamName ?? 'search';
  const defaultPerPage = options?.defaultPerPage ?? 25;
  const defaultSortColumn = options?.defaultSortColumn;
  const defaultSortOrder = options?.defaultSortOrder ?? 'asc';
  const defaultFilterOption = options?.defaultFilter;
  const initialSortColumn = defaultSortColumn ?? defaultFilterOption?.sortColumn;
  const initialSortOrder = defaultSortOrder ?? defaultFilterOption?.sortOrder ?? 'asc';
  const paginate = options?.paginate ?? true;
  const debounceMs = options?.debounceMs ?? 0;

  const [filter, setFilterState] = useState<ListStateFilter>(() => ({
    ...(defaultFilterOption ?? {}),
    sortColumn: initialSortColumn,
    sortOrder: initialSortOrder,
  }));
  const [page, setPageState] = useState(1);
  const [perPage, setPerPageState] = useState(defaultPerPage);
  const [refreshKey, setRefreshKey] = useState(0);

  const setFilter = useCallback(
    (patch: Partial<ListStateFilter> | ((prev: ListStateFilter) => ListStateFilter)) => {
      setPageState(1);
      setFilterState((prev) => (typeof patch === 'function' ? patch(prev) : { ...prev, ...patch }));
    },
    []
  );

  const setSearch = useCallback((query: string) => {
    setPageState(1);
    setFilterState((prev) => ({ ...prev, search: query || undefined }));
  }, []);

  const setSort = useCallback((column: string) => {
    setPageState(1);
    setFilterState((prev) => {
      if (prev.sortColumn === column) {
        return { ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' };
      }
      return { ...prev, sortColumn: column, sortOrder: 'asc' };
    });
  }, []);

  const resetFilter = useCallback(() => {
    setPageState(1);
    setFilterState({
      ...(defaultFilterOption ?? {}),
      sortColumn: initialSortColumn,
      sortOrder: initialSortOrder,
    });
  }, [defaultFilterOption, initialSortColumn, initialSortOrder]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const setPage = useCallback((p: number) => setPageState(p), []);

  const setPerPage = useCallback((size: number) => {
    setPageState(1);
    setPerPageState(size);
  }, []);

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

  const buildListParams = useCallback(() => {
    const params = new URLSearchParams();
    if (filter.search) params.append(searchParamName, filter.search);
    for (const [key, val] of Object.entries(filter)) {
      if (key === 'search' || key === 'sortColumn' || key === 'sortOrder') continue;
      if (Array.isArray(val)) {
        for (const item of val) {
          if (item !== undefined && item !== null && item !== '') params.append(`${key}[]`, String(item));
        }
      } else if (val !== undefined && val !== '') params.append(key, String(val));
    }
    if (filter.sortColumn) {
      params.append(`sort_by[${filter.sortColumn}]`, filter.sortOrder ?? 'asc');
    }
    if (paginate) {
      params.append('page', String(page));
      params.append('per_page', String(perPage));
    }
    return params;
  }, [filter, page, perPage, searchParamName, paginate]);

  useEffect(() => {
    if (!listStateEnabled || !getUrl) return;
    const sep = getUrl.includes('?') ? '&' : '?';
    const url = `${getUrl}${sep}${buildListParams().toString()}`;
    if (debounceMs > 0) {
      const timer = setTimeout(() => getAll(url), debounceMs);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getAll(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listStateEnabled, getUrl, buildListParams, refreshKey]);

  const list = useMemo<EntityListState | undefined>(() => {
    if (!listStateEnabled) return undefined;
    return { filter, setFilter, setSearch, setSort, resetFilter, refresh, page, perPage, setPage, setPerPage };
  }, [listStateEnabled, filter, setFilter, setSearch, setSort, resetFilter, refresh, page, perPage, setPage, setPerPage]);

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
      if (newEntity && newEntity.data) {
        setEntities(prev => [...prev, newEntity.data]);
      } 
      return newEntity;
    } catch (err: any) {
      setFnError('create', handleApiError(err, { silent: true }));
      throw err;
    } finally {
      setFnLoading('create', false);
    }
  }, [usecase, idem, getAll, getUrl]);

  const update = useCallback(async (id: number, data: UpdateEntityDTO<T>) => {
    setFnLoading('update', true);
    setFnError('update', null);
    try {
      const updated = await idem.run('update', { id, data }, (key) => usecase.update(id, data, key));
      if (updated && updated.data) {
        setEntities(prev => prev.map(u => u.id === id ? updated.data : u));
      } else if (getUrl && listStateEnabled) {
        // Idempotency replay returned no body (server already processed) — refresh the list with active filters
        const sep = getUrl.includes('?') ? '&' : '?';
        getAll(`${getUrl}${sep}${buildListParams().toString()}`).catch(() => undefined);
      } else if (getUrl) {
        // Idempotency replay returned no body (server already processed) — refresh the list
        getAll().catch(() => undefined);
      }
      return updated;
    } catch (err: any) {
      setFnError('update', handleApiError(err, { silent: true }));
      throw err;
    } finally {
      setFnLoading('update', false);
    }
  }, [usecase, idem, getAll, getUrl, listStateEnabled, buildListParams]);

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
    ...(list ? { list } : {}),
  };
}
