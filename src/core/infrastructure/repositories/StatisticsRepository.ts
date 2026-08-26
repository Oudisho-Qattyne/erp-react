import type { ApiClient } from "../../domain/common/api/ApiClient";
import type { DomainResponse } from "../../domain/common/responce/DomainResponse";
import type { IStatisticsRepository, ReportStatistics } from "../../domain/repositories/IStatisticsRepository";

/**
 * Generic grouping-report repository: GET `{baseUrl}/reports/grouping`.
 */
export const createStatisticsRepository = (apiClient: ApiClient, baseUrl: string): IStatisticsRepository => ({
  getStatistics: (params?: URLSearchParams | Record<string, string | boolean | number>, idempotencyKey?: string) => {
    const url = `${baseUrl}/reports/grouping`;
    const config = idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined;
    if (params instanceof URLSearchParams) {
      const qs = params.toString();
      return apiClient.get<DomainResponse<ReportStatistics[]>>(qs ? `${url}?${qs}` : url, config);
    }
    return apiClient.get<DomainResponse<ReportStatistics[]>>(url, params ? { params, ...config } : config);
  },
})
