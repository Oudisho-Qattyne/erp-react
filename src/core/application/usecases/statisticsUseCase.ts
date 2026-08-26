import type { DomainResponse } from "../../domain/common/responce/DomainResponse";
import type { GroupingReportStatistics, GroupingStatisticsFilters } from "../../domain/repositories/IStatisticsRepository";
import type { IGroupingStatisticsRepository } from "../../domain/repositories/IStatisticsRepository";
import type { GroupingStatisticsUsecase } from "../../domain/usecase/IStatisticsUseCase";

interface CreateGroupingStatisticsUsecaseOptions {
  /** Query param name carrying the grouping fields. Default 'factor'. */
  factorParamName? : string;
}

const buildQuery = (factor: string, filters: GroupingStatisticsFilters | undefined, factorParamName: string): URLSearchParams => {
  const query = new URLSearchParams();
  if (factor) query.append(factorParamName, factor);
  for (const [key, val] of Object.entries(filters ?? {})) {
    if (val === undefined || val === null || val === '') continue;
    if (Array.isArray(val)) {
      for (const item of val) {
        if (item !== undefined && item !== null && item !== '') query.append(`${key}[]`, String(item));
      }
    } else {
      query.append(key, String(val));
    }
  }
  return query;
};

export function createGroupingStatisticsUsecase(
  repository: IGroupingStatisticsRepository,
  options?: CreateGroupingStatisticsUsecaseOptions
): GroupingStatisticsUsecase {
  const factorParamName = options?.factorParamName ?? 'factor';
  return {
    async getStatistics(factor: string, filters?: GroupingStatisticsFilters, idempotencyKey?: string): Promise<DomainResponse<GroupingReportStatistics[]>> {
      try {
        return await repository.getStatistics(buildQuery(factor, filters, factorParamName), idempotencyKey);
      } catch (error : any) {
        throw error;
      }
    },
  };
}
