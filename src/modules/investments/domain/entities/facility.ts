import type { Dossier } from "./dossier";
import type { Plot } from "./plot";
import type { PartnershipType } from "./partnershipType";
import type { AuthorizedPerson } from "./authorizedPerson";
import type { ConsumptionMaterial } from "./consumptionMaterial";

export interface ProductionCapacityRow {
  material: string;
  production: string;
}

export interface DailyConsumptionRow {
  id: number;
  consumable_material?:ConsumptionMaterial
  consumption: string;
}

export interface Facility {
  id: number;
  plot_id: number;
  plot?:Plot;
  plot_dossier_id: number;
  plot_dossier?:Dossier;
  name: string;
  partnership_type_id?: number;
  partnership_type?: PartnershipType;
  address: string;
  company_type?: string;
  commercial_register?: string;
  commercial_register_date?: string;
  company_nationality_id?: number;
  first_phone_number: string;
  second_phone_number?: string;
  email?: string;
  total_capital_in_usd?: number;
  total_capital_in_syp?: number;
  value_of_machines_in_usd?: number;
  value_of_machines_in_syp?: number;
  number_of_workers?: number;
  number_or_patrols?: number;
  telephone_lines_number?: number;
  monthly_internet_data_requirement?: number;
  yearly_imported_raw_materials?: string;
  export_to_production_ratio?: number;
  daily_production_capacities?: ProductionCapacityRow[];
  monthly_production_capacities?: ProductionCapacityRow[];
  yearly_production_capacities?: ProductionCapacityRow[];
  daily_consumption?: DailyConsumptionRow[];
  electrical_power_capacity?: string;
  yearly_estimated_drinking_water_consumption?: number;
  yearly_estimated_industrial_water_consumption?: number;
  folder_id?: string;
  created_at?: string;
  require_all_persons_for_legal_matters:boolean;
  authorized_persons?:AuthorizedPerson[]
}
