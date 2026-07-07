import { useState, useCallback } from 'react';
import type { AuditLog } from '../../../../domain/entities/auditLog/auditLog';
import { useApiClient } from '../../../context/api/ApiClinetProvider';
import { createAuditLogsRepository } from '../../../../infrastructure/repositories/AuditLogsRepository';
import { createAuditLogsUseCase } from '../../../../application/usecases/manageAufitLogsUseCase';

export interface UseAuditLogsReturn {
  auditLogs: AuditLog[];
  loading: boolean;
  error: string | null;
  getAuditLogs: (model: string, modelId?: number) => Promise<void>;
  clearError: () => void;
}

export const useAuditLogs = (): UseAuditLogsReturn => {
  const apiClient = useApiClient();

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = createAuditLogsRepository(apiClient);
  const useCase = createAuditLogsUseCase(repository);

  const clearError = useCallback(() => setError(null), []);

  const getAuditLogs = useCallback(async (model: string, modelId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await useCase.getAuditLogs(model, modelId);
      setAuditLogs(res.data);
    } catch (err: any) {
      const msg = err.message || 'Failed to load audit logs';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [useCase]);

  return {
    auditLogs,
    loading,
    error,
    getAuditLogs,
    clearError,
  };
};
