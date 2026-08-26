import type { DomainResponse } from "../common/responce/DomainResponse";

/** One row of a `/reports/grouping` report payload. */
export interface ReportStatistics {
  [key: string]: string | number | undefined;
}

/** Filters may hold scalars or arrays (serialized as `key[]` repeats). */
export interface StatisticsFilters {
  [key: string] : string | number | boolean | undefined | (string | number | boolean)[];
}

export interface IStatisticsRepository {
  getStatistics : (params?: URLSearchParams | Record<string, string | boolean | number>, idempotencyKey?: string) => Promise<DomainResponse<ReportStatistics[]>>;
}
