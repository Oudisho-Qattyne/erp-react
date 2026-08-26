import type { DomainResponse } from "../../domain/common/responce/DomainResponse";
import type { ReportStatistics, StatisticsFilters } from "../../domain/repositories/IStatisticsRepository";
import type { IStatisticsRepository } from "../../domain/repositories/IStatisticsRepository";
import type { StatisticsUsecase } from "../../domain/usecase/IStatisticsUseCase";

interface CreateStatisticsUsecaseOptions {
  /** Query param name carrying the grouping fields. Default 'factor'. */
  factorParamName? : string;
}

const buildQuery = (factor: string, filters: StatisticsFilters | undefined, factorParamName: string): URLSearchParams => {
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

export function createStatisticsUsecase(
  repository: IStatisticsRepository,
  options?: CreateStatisticsUsecaseOptions
): StatisticsUsecase {
  const factorParamName = options?.factorParamName ?? 'factor';
  return {
    async getStatistics(factor: string, filters?: StatisticsFilters, idempotencyKey?: string): Promise<DomainResponse<ReportStatistics[]>> {
      try {
        return await repository.getStatistics(buildQuery(factor, filters, factorParamName), idempotencyKey);
      } catch (error : any) {
        throw error;
      }
    },
  };
}
