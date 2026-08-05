import { useState, useCallback } from 'react';
import type { AuditLog } from '../../../../domain/entities/auditLog/auditLog';
import { useApiClient } from '../../../context/api/ApiClinetProvider';
import { createAuditLogsRepository } from '../../../../infrastructure/repositories/AuditLogsRepository';
import { createAuditLogsUseCase } from '../../../../application/usecases/manageAufitLogsUseCase';
import { handleApiError } from '../../../utils/handleApiError';
import type { DpomainResponsePaginated } from '../../../../../modules/hr/domain/entities/common/DomainResponsePaginated';

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

export interface UseAuditLogsReturn {
  auditLogs: AuditLog[];
  loading: boolean;
  error: string | null;
  pagination?: PaginationInfo;
  getAuditLogs: (model: string, modelId?: number, page?: number, perPage?: number) => Promise<void>;
  clearError: () => void;
}

export const useAuditLogs = (): UseAuditLogsReturn => {
  const apiClient = useApiClient();

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>();

  const repository = createAuditLogsRepository(apiClient);
  const useCase = createAuditLogsUseCase(repository);

  const clearError = useCallback(() => setError(null), []);

  const getAuditLogs = useCallback(async (model: string, modelId?: number, page?: number, perPage?: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await useCase.getAuditLogs(model, modelId, page, perPage);
      setAuditLogs(res.data);
      setPagination(extractPagination(res));
    } catch (err: any) {
      setError(handleApiError(err, { module: "core", silent: true }));
    } finally {
      setLoading(false);
    }
  }, [useCase]);

  return {
    auditLogs,
    loading,
    error,
    pagination,
    getAuditLogs,
    clearError,
  };
};
