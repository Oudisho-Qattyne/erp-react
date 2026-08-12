import { useCallback, useMemo, useState } from 'react';
import { useApiClient } from '../../../../core/presentation/context/api/ApiClinetProvider';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { createSubscriptionRepository } from '../../infrastructure/repositories/SubscriptionRepository';
import { createSubscriptionUseCase } from '../../application/usecases/subscriptionUseCase';
import { handleApiError } from '../../../../core/presentation/utils/handleApiError';
import { useIdempotency } from '../../../../core/presentation/hooks/useIdempotency';
import type { CreateSubscriptionDTO } from '../../domain/repositories/ISubscriptionRepository';
import { toast } from 'sonner';

const MODULE = 'investments';

const OP_KEYS = ['createSubscription'] as const;

function initRecord<T>(value: T): Record<string, T> {
  return Object.fromEntries(OP_KEYS.map((k) => [k, value]));
}

export interface UseSubscriptionReturn {
  loading: Record<string, boolean>;
  isLoading: () => boolean;
  error: Record<string, string | null>;
  hasErrors: () => boolean;
  clearError: () => void;
  createSubscription: (plotId: number, data: CreateSubscriptionDTO) => Promise<void>;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const apiClient = useApiClient();
  const { t } = useLanguage();

  const [loading, setLoading] = useState<Record<string, boolean>>(() => initRecord(false));
  const [error, setError] = useState<Record<string, string | null>>(() => initRecord(null));

  const usecase = useMemo(
    () => createSubscriptionUseCase(createSubscriptionRepository(apiClient)),
    [apiClient]
  );
  const idem = useIdempotency();

  const setFnLoading = (fn: string, v: boolean) => setLoading((p) => ({ ...p, [fn]: v }));
  const setFnError = (fn: string, e: string | null) => setError((p) => ({ ...p, [fn]: e }));

  const clearError = useCallback(() => setError(initRecord(null)), []);

  const createSubscription = useCallback(async (plotId: number, data: CreateSubscriptionDTO) => {
    setFnLoading('createSubscription', true);
    setFnError('createSubscription', null);
    try {
      await idem.run('createSubscription', data, (key) => usecase.createSubscription(plotId, data, key));
      toast.success(t('transactions.created', MODULE) || 'Subscription created successfully');
    } catch (err: unknown) {
      setFnError('createSubscription', handleApiError(err, { module: MODULE }));
      throw err;
    } finally {
      setFnLoading('createSubscription', false);
    }
  }, [usecase, t, idem]);

  const isLoading = useCallback(() => Object.values(loading).some(Boolean), [loading]);
  const hasErrors = useCallback(() => Object.values(error).some((e) => e !== null), [error]);

  return {
    loading,
    isLoading,
    error,
    hasErrors,
    clearError,
    createSubscription,
  };
};