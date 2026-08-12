import type { Dossier } from "./dossier";
import type { Plot } from "./plot";
import type { PartnershipType } from "./partnershipType";
import type { AuthorizedPerson } from "./authorizedPerson";

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
  city: string;
  first_phone_number: string;
  second_phone_number?: string;
  email?: string;
  capital_in_usd?: number;
  capital_in_syp?: number;
  value_of_machines_in_usd?: number;
  value_of_machines_in_syp?: number;
  number_of_workers?: number;
  daily_production_capacity?: number;
  monthly_production_capacity?: number;
  yearly_production_capacity?: number;
  electrical_power_capacity?: string;
  yearly_estimated_water_consumption?: number ;
  folder_id?: string;
  require_all_persons_for_legal_matters:boolean;
  authorized_persons?:AuthorizedPerson[]
}
