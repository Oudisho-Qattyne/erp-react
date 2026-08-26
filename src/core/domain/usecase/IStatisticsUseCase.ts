import type { DomainResponse } from "../common/responce/DomainResponse";
import type { GroupingReportStatistics, GroupingStatisticsFilters } from "../repositories/IStatisticsRepository";

export type { GroupingStatisticsFilters } from "../repositories/IStatisticsRepository";

export interface GroupingStatisticsUsecase {
  /**
   * @param factor  Field(s) to group the statistics by (e.g. 'status' or 'status,nationality')
   * @param filters Optional filters applied to the report
   */
  getStatistics : (factor: string, filters?: GroupingStatisticsFilters, idempotencyKey?: string) => Promise<DomainResponse<GroupingReportStatistics[]>>;
}
