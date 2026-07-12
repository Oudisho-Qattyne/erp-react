import { useState, useCallback } from 'react';
import type { DpomainResponsePaginated } from '../../../../modules/hr/domain/entities/common/DomainResponsePaginated';
import type { EntityWithNameOnly } from '../../../domain/entities/EntityWithNameOnly';
import { useEntityCrud, type UseEntityCrudReturn, type QueryParams } from './useEntity';

export interface NestedEntityConfig {
  /** Nested list endpoint, e.g. `shared-kernal/countries/${countryId}/cities` */
  buildListUrl: (parentId: number) => string;
  /** Flat CRUD endpoint, e.g. `shared-kernal/cities` */
  restUrl: string;
}

export interface UseNestedEntityCrudReturn<T>
  extends Omit<UseEntityCrudReturn<T>, 'getAll'> {
  parentId: number | null;
  setParentId: (id: number | null) => void;
  /** Fetch list for a parent id (create/update/delete still use restUrl) */
  getAllForParent: (parentId: number, params?: QueryParams) => Promise<DpomainResponsePaginated<T[]>>;
  /** Pass parent id, or use parentId already set via setParentId / getAllForParent */
  getAll: (parentId?: number, params?: QueryParams) => Promise<DpomainResponsePaginated<T[]>>;
}

/**
 * Wraps useEntityCrud when the list (GET all) URL is nested under a parent
 * but create / update / getById / delete use a flat rest URL.
 */
export function useNestedEntityCrud<T extends EntityWithNameOnly>(
  config: NestedEntityConfig
): UseNestedEntityCrudReturn<T> {
  const [parentId, setParentId] = useState<number | null>(null);

  const listUrl =
    parentId != null ? config.buildListUrl(parentId) : '';

  const crud = useEntityCrud<T>(listUrl, config.restUrl);

  const getAllForParent = useCallback(
    async (id: number, params?: QueryParams) => {
      setParentId(id);
      return crud.getAll(config.buildListUrl(id), params);
    },
    [crud, config.buildListUrl]
  );

  const getAll = useCallback(
    async (parentIdOverride?: number, params?: QueryParams) => {
      const id = parentIdOverride ?? parentId;
      if (id == null) {
        throw new Error('Parent id is required to fetch the list');
      }
      if (parentIdOverride != null) {
        setParentId(parentIdOverride);
      }
      return crud.getAll(config.buildListUrl(id), params);
    },
    [crud, parentId, config.buildListUrl]
  );

  return {
    ...crud,
    getAll,
    parentId,
    setParentId,
    getAllForParent,
  };
}
