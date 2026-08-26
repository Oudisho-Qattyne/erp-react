import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApiClient } from "../../../context/api/ApiClinetProvider";
import { handleApiError } from "../../../utils/handleApiError";
import { useIdempotency } from "../../useIdempotency";
import { createGroupingStatisticsRepository } from "../../../../infrastructure/repositories/StatisticsRepository";
import { createGroupingStatisticsUsecase } from "../../../../application/usecases/statisticsUseCase";
import type { GroupingReportStatistics, GroupingStatisticsFilters } from "../../../../domain/repositories/IStatisticsRepository";

export type { GroupingStatisticsFilters, GroupingReportStatistics } from "../../../../domain/repositories/IStatisticsRepository";

const initRecord = <T,>(value: T): Record<string, T> => ({});

export interface UseStatisticsOptions {
  /** Base url of the resource, e.g. '/investments/investors' → GET '{baseUrl}/reports/grouping' */
  baseUrl : string;
  /** Field(s) the statistics are grouped by, e.g. 'status' or 'status,nationality' */
  factor : string;
  /** Initial filter. `resetFilter` returns to this. */
  defaultFilter? : GroupingStatisticsFilters;
  /** Set false to disable auto-fetching (e.g. while a dialog is closed). Default true. */
  enabled? : boolean;
  /** Debounce refetches (ms). Default 0 (immediate). */
  debounceMs? : number;
}

export interface UseStatisticsReturn {
  data : GroupingReportStatistics[];
  loading : boolean;
  loadingMap : Record<string, boolean>;
  isLoading : () => boolean;
  error : string | null;
  errorMap : Record<string, string | null>;
  hasErrors : () => boolean;
  clearError : () => void;

  getStatistics : () => Promise<void>;

  filter : GroupingStatisticsFilters;
  setFilter : (patch: Partial<GroupingStatisticsFilters>) => void;
  resetFilter : () => void;
  refresh : () => void;
}

/**
 * Grouping-statistics report hook. Auto-fetches `{baseUrl}/reports/grouping`
 * with `factor` + filters whenever they change (same pattern as useEntityCrud).
 */
export function useStatistics({ baseUrl, factor, defaultFilter = {}, enabled = true, debounceMs = 0 }: UseStatisticsOptions): UseStatisticsReturn {
  const apiClient = useApiClient();
  const { run } = useIdempotency();

  const repository = createGroupingStatisticsRepository(apiClient, baseUrl);
  const usecase = createGroupingStatisticsUsecase(repository);

  const [data, setData] = useState<GroupingReportStatistics[]>([]);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>(() => initRecord(false));
  const [errorMap, setErrorMap] = useState<Record<string, string | null>>(() => initRecord(null));
  const [filter, setFilterState] = useState<GroupingStatisticsFilters>(defaultFilter);
  const [refreshKey, setRefreshKey] = useState(0);
  const requestIdRef = useRef(0);

  const setFnLoading = (fn: string, v: boolean) => setLoadingMap((p) => ({ ...p, [fn]: v }));
  const setFnError = (fn: string, e: string | null) => setErrorMap((p) => ({ ...p, [fn]: e }));

  const loading = Object.values(loadingMap).some(Boolean);
  const error = Object.values(errorMap).find((e) => e !== null) ?? null;
  const isLoading = useCallback(() => Object.values(loadingMap).some(Boolean), [loadingMap]);
  const hasErrors = useCallback(() => Object.values(errorMap).some((e) => e !== null), [errorMap]);
  const clearError = useCallback(() => setErrorMap(initRecord(null)), []);

  const setFilter = useCallback((patch: Partial<GroupingStatisticsFilters>) => {
    setFilterState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilterState(defaultFilter);
  }, [defaultFilter]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    setFilterState(defaultFilter);
  }, [defaultFilter]);

  const getStatistics = useCallback(async (): Promise<void> => {
    const requestId = ++requestIdRef.current;
    setFnLoading('getStatistics', true);
    setFnError('getStatistics', null);
    try {
      const res = await run(
        'getStatistics',
        { baseUrl, factor, filter },
        (key) => usecase.getStatistics(factor, filter, key)
      );
      if (requestIdRef.current !== requestId) return;
      setData(res.data ?? []);
    } catch (err: any) {
      if (requestIdRef.current !== requestId) return;
      setFnError('getStatistics', handleApiError(err, { silent: true }));
    } finally {
      if (requestIdRef.current === requestId) setFnLoading('getStatistics', false);
    }
  }, [run, usecase, baseUrl, factor, filter]);

  useEffect(() => {
    if (!enabled || !baseUrl || !factor) return;
    if (debounceMs > 0) {
      const timer = setTimeout(() => getStatistics(), debounceMs);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, baseUrl, factor, filter, refreshKey]);

  return useMemo(
    () => ({
      data,
      loading,
      loadingMap,
      isLoading,
      error,
      errorMap,
      hasErrors,
      clearError,
      getStatistics,
      filter,
      setFilter,
      resetFilter,
      refresh,
    }),
    [data, loading, loadingMap, isLoading, error, errorMap, hasErrors, clearError, getStatistics, filter, setFilter, resetFilter, refresh]
  );
}
