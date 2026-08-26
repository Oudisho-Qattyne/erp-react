import type { ApiClient } from "../../domain/common/api/ApiClient";
import type { DomainResponse } from "../../domain/common/responce/DomainResponse";
import type { IGroupingStatisticsRepository, GroupingReportStatistics } from "../../domain/repositories/IStatisticsRepository";

/**
 * Generic grouping-report repository: GET `{baseUrl}/reports/grouping`.
 */
export const createGroupingStatisticsRepository = (apiClient: ApiClient, baseUrl: string): IGroupingStatisticsRepository => ({
  getStatistics: (params?: URLSearchParams | Record<string, string | boolean | number>, idempotencyKey?: string) => {
    const url = `${baseUrl}/reports/grouping`;
    const config = idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined;
    if (params instanceof URLSearchParams) {
      const qs = params.toString();
      return apiClient.get<DomainResponse<GroupingReportStatistics[]>>(qs ? `${url}?${qs}` : url, config);
    }
    return apiClient.get<DomainResponse<GroupingReportStatistics[]>>(url, params ? { params, ...config } : config);
  },
})
