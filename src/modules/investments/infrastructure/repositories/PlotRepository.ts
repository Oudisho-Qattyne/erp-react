import type { ApiClient } from "../../../../core/domain/common/api/ApiClient"
import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse"
import type { Plot } from "../../domain/entities/plot"
import type { IPlotRepository, PlotStatusBody } from "../../domain/repositories/IPlotRepository"

export const createPlotRepository = (apiClient: ApiClient): IPlotRepository => {
  const baseUrl = "/investments/plots"
  return ({
    changeStatus: (plotId: number, body: PlotStatusBody, idempotencyKey?: string) =>
      apiClient.put<DomainResponse<Plot>>(`${baseUrl}/${plotId}/status`, body, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined),
  })
}
