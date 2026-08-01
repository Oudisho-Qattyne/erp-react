import { useApiClient } from "../../../../core/presentation/context/api/ApiClinetProvider"
import { useIdempotency } from "../../../../core/presentation/hooks/useIdempotency"
import { createPlotRepository } from "../../infrastructure/repositories/PlotRepository"
import { createManagePlotsUseCase } from "../../application/usecases/managePlots"
import type { PlotStatusBody } from "../../domain/repositories/IPlotRepository"

export interface UsePlotStatusReturn {
  changeStatus: (plotId: number, body: PlotStatusBody) => Promise<void>;
}

export const usePlotStatus = (): UsePlotStatusReturn => {
  const apiClient = useApiClient()
  const repository = createPlotRepository(apiClient)
  const useCase = createManagePlotsUseCase(repository)
  const idem = useIdempotency()

  const changeStatus = async (plotId: number, body: PlotStatusBody): Promise<void> => {
    const key = idem.getKey('changePlotStatus', { plotId, body })
    try {
      await useCase.changeStatus(plotId, body, key)
      idem.onSettled(undefined, key)
    } catch (err) {
      idem.onSettled(err, key)
      throw err
    }
  }

  return { changeStatus }
}
