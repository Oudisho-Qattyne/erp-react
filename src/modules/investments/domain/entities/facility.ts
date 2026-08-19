import type { Dossier } from "./dossier";
import type { Plot } from "./plot";
import type { PartnershipType } from "./partnershipType";
import type { AuthorizedPerson } from "./authorizedPerson";

export interface ProductionCapacityRow {
  material: string;
  production: string;
}

export interface DailyConsumptionRow {
  material: number;
  consumption: string;
  unit?: string;
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
  company_status?: string;
  commercial_registry?: string;
  commercial_registry_date?: string;
  company_nationality_id?: number;
  first_phone_number: string;
  second_phone_number?: string;
  email?: string;
  capital_in_usd?: number;
  capital_in_syp?: number;
  value_of_machines_in_usd?: number;
  value_of_machines_in_syp?: number;
  number_of_workers?: number;
  number_of_patrols?: number;
  number_of_phone_lines?: number;
  internet_need_monthly_gb?: number;
  imported_raw_materials_annually?: string;
  export_percentage?: number;
  daily_production_capacity?: ProductionCapacityRow[];
  monthly_production_capacity?: ProductionCapacityRow[];
  yearly_production_capacity?: ProductionCapacityRow[];
  daily_consumption_volume?: DailyConsumptionRow[];
  electrical_power_capacity?: string;
  yearly_estimated_water_consumption?: number ;
  folder_id?: string;
  require_all_persons_for_legal_matters:boolean;
  authorized_persons?:AuthorizedPerson[]
}
