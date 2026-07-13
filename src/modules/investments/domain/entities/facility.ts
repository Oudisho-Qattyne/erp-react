export interface Facility {
  id: number;
  plot_id: number;
  plot_dossier_id: number;
  name: string;
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
}
