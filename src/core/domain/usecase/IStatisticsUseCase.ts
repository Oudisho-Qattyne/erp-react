import type { DomainResponse } from "../common/responce/DomainResponse";
import type { ReportStatistics, StatisticsFilters } from "../repositories/IStatisticsRepository";

export type { StatisticsFilters } from "../repositories/IStatisticsRepository";

export interface StatisticsUsecase {
  /**
   * @param factor  Field(s) to group the statistics by (e.g. 'status' or 'status,nationality')
   * @param filters Optional filters applied to the report
   */
  getStatistics : (factor: string, filters?: StatisticsFilters, idempotencyKey?: string) => Promise<DomainResponse<ReportStatistics[]>>;
}
