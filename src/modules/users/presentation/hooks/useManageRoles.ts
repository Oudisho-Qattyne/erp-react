import { useState, useMemo, useCallback } from 'react';
import type { Role, DetailedRole } from '../../domain/entities/role';
import type { DomainResponse } from '../../../../core/domain/common/responce/DomainResponse';
import { useApiClient } from '../../../../core/presentation/context/api/ApiClinetProvider';
import { createManageRoleUseCase } from '../../application/usecases/manageRoleUseCase';
import { createCrudRoleRepository } from '../../infrastructure/repositories';
import { useIdempotency } from '../../../../core/presentation/hooks/useIdempotency';
import { handleApiError } from '../../../../core/presentation/utils/handleApiError';
import type { Permissions } from '../../domain/entities/permissions';
import type { CreateRoleData, UpdateRoleData } from '../../application/dtos/roleDto';

export interface UseManageRolesReturn {
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
  clearError: (key?: string) => void;
  getAll: () => Promise<DomainResponse<Role[]>>;
  getById: (id: number) => Promise<DomainResponse<DetailedRole>>;
  create: (data: CreateRoleData) => Promise<DomainResponse<Role>>;
  update: (id: number, data: UpdateRoleData) => Promise<DomainResponse<DetailedRole>>;
  remove: (id: number) => Promise<DomainResponse<[]>>;
  getPermissions: () => Promise<DomainResponse<Permissions>>;
}

const OP_KEYS = ['getAll', 'getById', 'create', 'update', 'remove', 'getPermissions'] as const;

function initRecord<T>(value: T): Record<string, T> {
  return Object.fromEntries(OP_KEYS.map((k) => [k, value]));
}

export function useManageRoles(): UseManageRolesReturn {
  const apiClient = useApiClient();
  const [loading, setLoading] = useState<Record<string, boolean>>(() => initRecord(false));
  const [error, setError] = useState<Record<string, string | null>>(() => initRecord(null));
  const repository = useMemo(() => createCrudRoleRepository(apiClient), [apiClient]);
  const usecase = useMemo(() => createManageRoleUseCase(repository), [repository]);
  const idem = useIdempotency();

  const clearError = useCallback((key?: string) => {
    if (key) {
      setError((prev) => ({ ...prev, [key]: null }));
    } else {
      setError(initRecord(null));
    }
  }, []);

  const wrap = useCallback(<T,>(key: string, fn: () => Promise<T>): Promise<T> => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    setError((prev) => ({ ...prev, [key]: null }));
    return fn()
      .catch((err: any) => {
        setError((prev) => ({ ...prev, [key]: handleApiError(err, { module: "users", silent: true }) }));
        throw err;
      })
      .finally(() => setLoading((prev) => ({ ...prev, [key]: false })));
  }, []);

  return {
    loading,
    error,
    clearError,
    getAll: () => wrap('getAll', () => usecase.getAll()),
    getById: (id) => wrap('getById', () => usecase.getById(id)),
    create: (data) => wrap('create', () => idem.run('createRole', data, (key) => usecase.create(data, key))),
    update: (id, data) => wrap('update', () => idem.run('updateRole', { id, data }, (key) => usecase.update(id, data, key))),
    remove: (id) => wrap('remove', () => usecase.delete(id)),
    getPermissions: () => wrap('getPermissions', () => usecase.getPermissions()),
  };
}
