import type { User } from "../../../users/domain/entities/user/user";
import type { PlotStatus } from "../valueObjects/plots/plotStatus";
import type { PlotArea } from "./plotArea";
import type { PlotClassification } from "./plotClassification";

export interface Plot {
  id: number;
  code: string;
  identifier: string;
  status: PlotStatus;
  area: number;
  plot_area_id: number;
  plot_classification_id: number;
  latitude: string;
  longitude: string;
  plot_area?: PlotArea;
  plot_classification?: PlotClassification;
  plot_area_name: string;
  plot_classification_name: string;
  current_condition?: string;
  notes?: string;
  status_date?: string;
  updated_at?: string;
  folder_id?: string;
  user: User
}
