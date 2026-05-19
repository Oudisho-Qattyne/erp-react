import { useState, useCallback } from 'react';
import type { DomainResponse } from '../../../domain/common/responce/DomainResponse';
import type { ManageEntityUsecase } from '../../../domain/usecase/IManageUseCase';

interface UseEntityCrudState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination?: DomainResponse<T>['pagination'];
}

export function useEntityCrud<T, TCreate, TUpdate, ID = number>(
  usecase: ManageEntityUsecase<T, TCreate, TUpdate, ID>
) {
  const [state, setState] = useState<UseEntityCrudState<T>>({
    data: [],
    loading: false,
    error: null,
  });

  const getAll = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await usecase.getAll();
      setState({
        data: response.data,
        loading: false,
        error: null,
        pagination: response.pagination,
      });
      return response;
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
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
      setState(prev => ({ ...prev, loading: false, error: err.message }));
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
      setState(prev => ({ ...prev, loading: false, error: err.message }));
      throw err;
    }
  }, [usecase]);

  const update = useCallback(async (id: ID, data: TUpdate) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const updated = await usecase.update(id, data);
      setState(prev => ({
        ...prev,
        data: prev.data.map(item => (item as any).id === id ? updated : item),
        loading: false,
      }));
      return updated;
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
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
      setState(prev => ({ ...prev, loading: false, error: err.message }));
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