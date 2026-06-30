export interface Plot {
  id: number;
  code: string;
  status: string;
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
}
