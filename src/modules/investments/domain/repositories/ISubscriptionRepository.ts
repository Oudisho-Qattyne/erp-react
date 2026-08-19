import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { ProductionCapacityRow, DailyConsumptionRow } from "../entities/facility";

export interface SubscriptionFacilityPayload {
  name: string;
  partnership_type_id?: number | null;
  address: string;
  company_type?: string;
  commercial_register?: string | null;
  commercial_register_date?: string | null;
  company_nationality_id?: number | null;
  first_phone_number: string;
  second_phone_number?: string | null;
  email?: string | null;
  total_capital_in_usd: number;
  total_capital_in_syp: number;
  value_of_machines_in_usd: number;
  value_of_machines_in_syp: number;
  number_of_workers: number;
  number_or_patrols?: number | null;
  telephone_lines_number?: number | null;
  monthly_internet_data_requirement?: number | null;
  yearly_imported_raw_materials?: string | null;
  export_to_production_ratio?: number | null;
  daily_production_capacities?: ProductionCapacityRow[];
  monthly_production_capacities?: ProductionCapacityRow[];
  yearly_production_capacities?: ProductionCapacityRow[];
  daily_consumption?: DailyConsumptionRow[];
  electrical_power_capacity: string;
  yearly_estimated_drinking_water_consumption: number;
  yearly_estimated_industrial_water_consumption: number;
  require_all_persons_for_legal_matters: boolean;
}

export interface SubscriptionAuthorizedPersonPayload {
  person: {
    id?: number;
    name?: string;
    email?: string | null;
    primary_phone_number?: string | null;
    whatsapp?: string | null;
    facebook?: string | null;
  };
  role_in_facility?: string;
  is_required_for_legal_matters?: boolean;
}

export interface SubscriptionInvestorPayload {
  id?: number;
  first_name?: string;
  father_name?: string;
  grandfather_name?: string;
  last_name?: string;
  mother_name?: string;
  national_id?: string;
  passport_number?: string;
  nationality?: string;
  gender?: 'male' | 'female';
  phone?: string;
  whatsapp_number?: string;
  email?: string | null;
  address?: string | null;
  facebook?: string;
  instagram?: string;
  x?: string;
  linkedin?: string;
  is_possible_investor_in_future?: boolean;
}

export interface CreateSubscriptionDTO {
  facility: SubscriptionFacilityPayload;
  authorized_persons: SubscriptionAuthorizedPersonPayload[];
  partners: {
    investor: SubscriptionInvestorPayload;
  }[];
}

export interface ISubscriptionRepository {
  createSubscription(plotId: number, data: CreateSubscriptionDTO, idempotencyKey?: string): Promise<DomainResponse<unknown>>;
}