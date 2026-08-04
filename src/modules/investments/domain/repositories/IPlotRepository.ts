import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { Plot } from "../entities/plot";

export interface PlotStatusBody {
  status: string;
  status_date?: string;
  notes?: string;
  allocated_dossier_id?: number;
}

export interface IPlotRepository {
  changeStatus(plotId: number, body: PlotStatusBody, idempotencyKey?: string): Promise<DomainResponse<Plot>>;
}
