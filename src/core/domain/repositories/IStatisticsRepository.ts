import type { DomainResponse } from "../common/responce/DomainResponse";

/** One row of a `/reports/grouping` report payload. */
export interface GroupingReportStatistics {
  [key: string]: string | number | undefined;
}

/** Filters may hold scalars or arrays (serialized as `key[]` repeats). */
export interface GroupingStatisticsFilters {
  [key: string] : string | number | boolean | undefined | (string | number | boolean)[];
}

export interface IGroupingStatisticsRepository {
  getStatistics : (params?: URLSearchParams | Record<string, string | boolean | number>, idempotencyKey?: string) => Promise<DomainResponse<GroupingReportStatistics[]>>;
}
