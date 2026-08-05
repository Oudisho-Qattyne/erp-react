import type { IPlotRepository, PlotStatusBody } from "../../domain/repositories/IPlotRepository"

export const createManagePlotsUseCase = (repository: IPlotRepository) => {
  return {
    changeStatus: (plotId: number, body: PlotStatusBody, idempotencyKey?: string) =>
      repository.changeStatus(plotId, body, idempotencyKey),
  }
}
