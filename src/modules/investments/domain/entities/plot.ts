import type { PlotStatus } from "../valueObjects/plots/plotStatus";

export interface Plot {
  id: number;
  code: string;
  identifier:string;
  status: PlotStatus;
  area: number;
  plot_area_id: number;
  plot_classification_id: number;
  latitude: string;
  longitude: string;
  plot_area_name?: string;
  plot_classification_name?: string;
  current_condition?: string;
  notes?: string;
  status_date?: string;
  created_at?: string;
  updated_at?: string;
  folder_id?:string;
}
