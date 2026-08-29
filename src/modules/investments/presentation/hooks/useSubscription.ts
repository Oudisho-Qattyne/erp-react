import { useState, useCallback, useMemo } from 'react';
import { useApiClient } from '../../../../core/presentation/context/api/ApiClinetProvider';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { createSubscriptionRepository } from '../../infrastructure/repositories/SubscriptionRepository';
import { createSubscriptionUseCase } from '../../application/usecases/subscriptionUseCase';
import { handleApiError } from '../../../../core/presentation/utils/handleApiError';
import { useIdempotency } from '../../../../core/presentation/hooks/useIdempotency';
import type { CreateSubscriptionDTO,  } from '../../application/dtos/subscriptionDtos';
import type { SubscriptionRequest } from '../../domain/entities/subscriptionRequests/subscriptionRequest';
import { toast } from 'sonner';
import type { SubscriptionRequestStatus } from '../../domain/valueObjects/investments/subscriptionRequestStatus';

const MODULE = 'investments';

const OP_KEYS = [
  'getAllSubscriptionRequests',
  'listAllSubscriptionRequests',
  'getSubscriptionRequestById',
  'changeSubscriptionRequestStatus',
  'completeSubscriptionRequest',
  'createSubscription',
] as const;

function initRecord<T>(value: T): Record<string, T> {
  return Object.fromEntries(OP_KEYS.map((k) => [k, value]));
}

export interface SubscriptionFilterState extends Record<string, any> {
  sortColumn?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SubscriptionPaginationInfo {
  lastPage: number;
  currentPage: number;
  hasMore: boolean;
  total: number;
}

export interface UseSubscriptionReturn {
  requests: SubscriptionRequest[];
  setRequests: (requests: SubscriptionRequest[]) => void;
  selectedRequest: SubscriptionRequest | null;
  setSelectedRequest: (request: SubscriptionRequest | null) => void;
  filters: Record<string, any>;
  setFilters: (patch: Partial<SubscriptionFilterState>) => void;
  setFilterValue: (key: string, value: any) => void;
  resetFilters: () => void;
  sortColumn: string;
  sortOrder: 'asc' | 'desc';
  setSort: (column: string) => void;
  page: number;
  setPage: (page: number) => void;
  perPage: number;
  setPerPage: (perPage: number) => void;
  pagination?: SubscriptionPaginationInfo;
  loading: Record<string, boolean>;
  isLoading: () => boolean;
  error: Record<string, string | null>;
  hasErrors: () => boolean;
  clearError: () => void;
  getAllSubscriptionRequests: (plotId: number) => Promise<void>;
  listAllSubscriptionRequests: () => Promise<void>;
  getSubscriptionRequestById: (subRequestId: number) => Promise<SubscriptionRequest>;
  changeSubscriptionRequestStatus: (plotId: number, subRequestId: number, status: SubscriptionRequestStatus) => Promise<void>;
  completeSubscriptionRequest: (plotId: number, subRequestId: number) => Promise<void>;
  createSubscription: (plotId: number, data: CreateSubscriptionDTO) => Promise<void>;
}

const SORTABLE_COLUMNS = ['id', 'plot_id', 'request_type', 'status', 'version', 'created_at'];

export const useSubscription = (): UseSubscriptionReturn => {
  const apiClient = useApiClient();
  const { t } = useLanguage();

  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<SubscriptionRequest | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>(() => initRecord(false));
  const [error, setError] = useState<Record<string, string | null>>(() => initRecord(null));

  const [filterState, setFilterState] = useState<SubscriptionFilterState>({ sortColumn: 'created_at', sortOrder: 'desc' });
  const [page, setPageState] = useState(1);
  const [perPage, setPerPageState] = useState(10);
  const [pagination, setPagination] = useState<SubscriptionPaginationInfo>();

  const repository = createSubscriptionRepository(apiClient);
  const usecase = createSubscriptionUseCase(repository);
  const idem = useIdempotency();

  const setFnLoading = (fn: string, v: boolean) => setLoading((p) => ({ ...p, [fn]: v }));
  const setFnError = (fn: string, e: string | null) => setError((p) => ({ ...p, [fn]: e }));

  const clearError = useCallback(() => setError(initRecord(null)), []);

  const filters = useMemo(() => {
    const rest: Record<string, any> = {};
    Object.entries(filterState).forEach(([key, val]) => {
      if (key === 'sortColumn' || key === 'sortOrder') return;
      rest[key] = val;
    });
    return rest;
  }, [filterState]);

  const sortColumn = filterState.sortColumn ?? 'created_at';
  const sortOrder = filterState.sortOrder ?? 'desc';

  const setFilters = useCallback((patch: Partial<SubscriptionFilterState>) => {
    setPageState(1);
    setFilterState((prev) => ({ ...prev, ...patch }));
  }, []);

  const setFilterValue = useCallback((key: string, value: any) => {
    setPageState(1);
    setFilterState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setPageState(1);
    setFilterState({ sortColumn: 'created_at', sortOrder: 'desc' });
  }, []);

  const setSort = useCallback((column: string) => {
    if (!SORTABLE_COLUMNS.includes(column)) return;
    setPageState(1);
    setFilterState((prev) => {
      if (prev.sortColumn === column) {
        return { ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' };
      }
      return { ...prev, sortColumn: column, sortOrder: 'asc' };
    });
  }, []);

  const setPerPage = useCallback((size: number) => {
    setPageState(1);
    setPerPageState(size);
  }, []);

  const buildParams = useCallback((): Record<string, any> => {
    const params: Record<string, any> = {};
    Object.entries(filters).forEach(([key, val]) => {
      if (val === '' || val === undefined || val === null) return;
      if (Array.isArray(val)) {
        if (val.length > 0) params[`${key}[]`] = val;
      } else {
        params[key] = val;
      }
    });
    params[`sort_by[${sortColumn}]`] = sortOrder;
    return params;
  }, [filters, sortColumn, sortOrder]);

  const getAllSubscriptionRequests = useCallback(async (plotId: number) => {
    setFnLoading('getAllSubscriptionRequests', true);
    setFnError('getAllSubscriptionRequests', null);
    try {
      const res = await usecase.getAllSubscriptionRequests(plotId, buildParams());
      setRequests(res.data);
    } catch (err: unknown) {
      setFnError('getAllSubscriptionRequests', handleApiError(err, { module: MODULE }));
      throw err;
    } finally {
      setFnLoading('getAllSubscriptionRequests', false);
    }
  }, [usecase, buildParams]);

  const listAllSubscriptionRequests = useCallback(async () => {
    setFnLoading('listAllSubscriptionRequests', true);
    setFnError('listAllSubscriptionRequests', null);
    try {
      const res = await usecase.listAllSubscriptionRequests({ ...buildParams(), page, per_page: perPage });
      setRequests(res.data);
      setPagination(res.pagination);
    } catch (err: unknown) {
      setFnError('listAllSubscriptionRequests', handleApiError(err, { module: MODULE }));
      throw err;
    } finally {
      setFnLoading('listAllSubscriptionRequests', false);
    }
  }, [usecase, buildParams, page, perPage]);

  const getSubscriptionRequestById = useCallback(async (subRequestId: number) => {
    setFnLoading('getSubscriptionRequestById', true);
    setFnError('getSubscriptionRequestById', null);
    try {
      const res = await usecase.getSubscriptionRequestById(subRequestId);
      setSelectedRequest(res.data);
      return res.data;
    } catch (err: unknown) {
      setFnError('getSubscriptionRequestById', handleApiError(err, { module: MODULE }));
      throw err;
    } finally {
      setFnLoading('getSubscriptionRequestById', false);
    }
  }, [usecase]);

  const changeSubscriptionRequestStatus = useCallback(async (plotId: number, subRequestId: number, status: SubscriptionRequestStatus) => {
    setFnLoading('changeSubscriptionRequestStatus', true);
    setFnError('changeSubscriptionRequestStatus', null);
    try {
      await idem.run('changeSubscriptionRequestStatus', { plotId, subRequestId, status }, (key) =>
        usecase.changeSubscriptionRequestStatus(plotId, subRequestId, status, key)
      );
      await listAllSubscriptionRequests();
      toast.success(t('subscription_requests.status_updated', MODULE) || 'Status updated successfully');
    } catch (err: unknown) {
      setFnError('changeSubscriptionRequestStatus', handleApiError(err, { module: MODULE, passThrough: true }));
      throw err;
    } finally {
      setFnLoading('changeSubscriptionRequestStatus', false);
    }
  }, [usecase, t, idem, listAllSubscriptionRequests]);

  const completeSubscriptionRequest = useCallback(async (plotId: number, subRequestId: number) => {
    setFnLoading('completeSubscriptionRequest', true);
    setFnError('completeSubscriptionRequest', null);
    try {
      await idem.run('completeSubscriptionRequest', { plotId, subRequestId }, (key) =>
        usecase.completeSubscriptionRequest(plotId, subRequestId, key)
      );
      await listAllSubscriptionRequests();
      toast.success(t('subscription_requests.complete_success', MODULE) || 'Request completed successfully');
    } catch (err: unknown) {
      setFnError('completeSubscriptionRequest', handleApiError(err, { module: MODULE, passThrough: true }));
      throw err;
    } finally {
      setFnLoading('completeSubscriptionRequest', false);
    }
  }, [usecase, t, idem, listAllSubscriptionRequests]);

  const createSubscription = useCallback(async (plotId: number, data: CreateSubscriptionDTO) => {
    setFnLoading('createSubscription', true);
    setFnError('createSubscription', null);
    try {
      await idem.run('createSubscription', data, (key) => usecase.createSubscription(plotId, data, key));
      toast.success(t('transactions.created', MODULE) || 'Subscription created successfully');
    } catch (err: unknown) {
      setFnError('createSubscription', handleApiError(err, { module: MODULE, passThrough: true }));
      throw err;
    } finally {
      setFnLoading('createSubscription', false);
    }
  }, [usecase, t, idem]);

  const isLoading = useCallback(() => Object.values(loading).some(Boolean), [loading]);
  const hasErrors = useCallback(() => Object.values(error).some((e) => e !== null), [error]);

  return {
    requests,
    setRequests,
    selectedRequest,
    setSelectedRequest,
    filters,
    setFilters,
    setFilterValue,
    resetFilters,
    sortColumn,
    sortOrder,
    setSort,
    page,
    setPage: setPageState,
    perPage,
    setPerPage,
    pagination,
    loading,
    isLoading,
    error,
    hasErrors,
    clearError,
    getAllSubscriptionRequests,
    listAllSubscriptionRequests,
    getSubscriptionRequestById,
    changeSubscriptionRequestStatus,
    completeSubscriptionRequest,
    createSubscription,
  };
};
