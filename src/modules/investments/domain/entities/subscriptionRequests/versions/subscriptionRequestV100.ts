export type PlotStatus = "unsold" | "announced" | "subscribed" | "allocated" | "separated";

export type SubscriptionRequestStatus =
  | "draft"
  | "active"
  | "allocatable"
  | "cancelled"
  | "pending_subscription_fee"
  | "subscription_fee_paid"
  | "subscription_approved"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "completed";

export type SubscriptionGender = "male" | "female";

export type FacilityCompanyType = "existing" | "under_incorporation";

export type SubscriptionTransactionType = "incoming" | "outgoing";

export type SubscriptionTransactionStatus = "pending" | "approved" | "rejected" | "paid";

export interface PlotInfo {
  id: number;
  code: string;
  identifier: string;
  area: string | null;
  plot_area_id: number | null;
  plot_classification_id: number | null;
  latitude: string | null;
  longitude: string | null;
  notes: string | null;
  folder_id: string | null;
  user_id: number | null;
  status: PlotStatus;
  created_at: string | null;
  updated_at: string | null;
  allocated_dossier_id: number | null;
}

export interface SubscriptionPartner {
  id: number;
  first_name: string;
  last_name: string;
  father_name: string | null;
  mother_name: string | null;
  grandfather_name: string | null;
  national_id: string | null;
  nationality: string | null;
  gender: SubscriptionGender | null;
  phone: string | null;
  facebook: string | null;
  instagram: string | null;
  x: string | null;
  linkedin: string | null;
  is_possible_investor_in_future: boolean;
  created_at: string | null;
  folder_id: string | null;
}

export interface SubscriptionPerson {
  id: number;
  name: string | null;
  email: string | null;
  role: string | null;
  primary_phone_number: string | null;
  secondary_phone_number: string | null;
  whatsapp: string | null;
  telegram: string | null;
  x: string | null;
  linkedin: string | null;
  facebook: string | null;
  type: string | null;
  created_at: string | null;
}

export interface SubscriptionAuthorizedPerson {
  person: SubscriptionPerson;
  role_in_facility: string | null;
  is_required_for_legal_matters: boolean;
}

export interface SubscriptionPartnershipType {
  id: number;
  name: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string | null;
}

export interface SubscriptionProductionCapacityRow {
  material: string;
  production: string;
}

export interface SubscriptionDailyConsumptionRow {
  id: number;
  consumable_material?: SubscriptionConsumptionMaterial;
  consumption: string;
}

export interface SubscriptionConsumptionMaterial extends SubscriptionEntityWithNameOnly {
  unit: string;
  is_active: boolean;
  is_default: boolean;
}

export interface SubscriptionEntityWithNameOnly {
  id: number;
  name: string | SubscriptionMultiLanguage;
  created_at?: string;
  updated_at?: string;
  is_default?: boolean;
}

export interface SubscriptionMultiLanguage {
  ar?: string;
  en?: string;
}

export interface SubscriptionFacility {
  id: number;
  plot_id: number;
  plot_dossier_id: number | null;
  name: string;
  address: string | null;
  company_type: FacilityCompanyType | null;
  commercial_register: string | null;
  commercial_register_date: string | null;
  company_nationality_id: number | null;
  first_phone_number: string | null;
  second_phone_number: string | null;
  email: string | null;
  total_capital_in_usd: number | null;
  total_capital_in_syp: number | null;
  value_of_machines_in_usd: number | null;
  value_of_machines_in_syp: number | null;
  number_of_workers: number | null;
  electrical_power_capacity: number | null;
  yearly_estimated_drinking_water_consumption: number | null;
  yearly_estimated_industrial_water_consumption: number | null;
  number_or_patrols: number | null;
  telephone_lines_number: number | null;
  monthly_internet_data_requirement: number | null;
  yearly_imported_raw_materials: string | null;
  export_to_production_ratio: number | null;
  daily_production_capacities?: SubscriptionProductionCapacityRow[];
  monthly_production_capacities?: SubscriptionProductionCapacityRow[];
  yearly_production_capacities?: SubscriptionProductionCapacityRow[];
  daily_consumption?: SubscriptionDailyConsumptionRow[];
  created_at: string | null;
  authorized_persons: SubscriptionAuthorizedPerson[];
  partnership_type: SubscriptionPartnershipType | null;
  folder_id: string | null;
  require_all_persons_for_legal_matters: boolean;
}

export interface SubscriptionTransaction {
  id: string;
  transaction_type: SubscriptionTransactionType;
  transaction_status: SubscriptionTransactionStatus;
  transaction_value: number | null;
  client_payed_amount: number | null;
  exchange_rate_id: string | null;
  exchange_rate: number | null;
  transaction_currency_id: string | null;
  transaction_date: string | null;
  formatted_transaction_date: string | null;
  reason: string | null;
  created_at: string | null;
}

export interface SubscriptionRequestV100 {
  id: number;
  plot: PlotInfo;
  dossier_number: string | null;
  status: SubscriptionRequestStatus;
  dossier_date: string | null;
  allocated_date: string | null;
  subscription_date: string | null;
  notes: string | null;
  created_at: string | null;
  partners: SubscriptionPartner[];
  facilities: SubscriptionFacility[];
  transactions: SubscriptionTransaction[];
}
