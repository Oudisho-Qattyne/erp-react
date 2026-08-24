import { useState, useCallback } from 'react';
import type { DomainResponse } from '../../../domain/common/responce/DomainResponse';
import type { ManageEntityUsecase } from '../../../domain/usecase/IManageUseCase';
import { handleApiError } from '../../utils/handleApiError';

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

interface UseEntityCrudState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination?: PaginationInfo;
}

export function useEntityCrud<T, TCreate, TUpdate, ID = number>(
  usecase: ManageEntityUsecase<T, TCreate, TUpdate, ID>
) {
  const [state, setState] = useState<UseEntityCrudState<T>>({
    data: [],
    loading: false,
    error: null,
  });

  const getAll = useCallback(async (params?: Record<string, string | boolean | number>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await usecase.getAll(params);
      setState({
        data: response.data,
        loading: false,
        error: null,
        pagination: extractPagination(response),
      });
      return response;
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: handleApiError(err, { silent: true }) }));
      throw err;
    }
  }, [usecase]);

  const getById = useCallback(async (id: ID) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const entity = await usecase.getById(id);
      setState(prev => ({ ...prev, loading: false }));
      return entity;
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: handleApiError(err, { silent: true }) }));
      throw err;
    }
  }, [usecase]);

  const create = useCallback(async (data: TCreate) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const newEntity = await usecase.create(data);
      setState(prev => ({
        ...prev,
        data: [...prev.data, newEntity as T],
        loading: false,
      }));
      return newEntity;
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: handleApiError(err, { silent: true }) }));
      throw err;
    }
  }, [usecase]);

  const update = useCallback(async (id: ID, data: TUpdate) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const updated = await usecase.update(id, data);
      setState(prev => ({
        ...prev,
        data: prev.data.map(item => (item as any).id === id ? updated.data : item),
        loading: false,
        
      }));
      return updated;
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: handleApiError(err, { silent: true }) }));
      throw err;
    }
  }, [usecase]);

  const remove = useCallback(async (id: ID) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await usecase.delete(id);
      setState(prev => ({
        ...prev,
        data: prev.data.filter(item => (item as any).id !== id),
        loading: false,
      }));
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: handleApiError(err, { silent: true }) }));
      throw err;
    }
  }, [usecase]);

  return {
    ...state,
    getAll,
    getById,
    create,
    update,
    remove,
  };
}
