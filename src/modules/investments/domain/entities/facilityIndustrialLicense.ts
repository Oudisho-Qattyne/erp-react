import type { IndustryCategory } from './industryCategory';
import type { IndustryType } from './industryType';
import type { IndustrialDecisionType } from './industrialDecisionType';
import type { IndustrialLicenseSource } from './industrialLicenseSource';
import type { Facility } from './facility';

export interface FacilityIndustrialLicense {
  id: number;
  facility_id: number | null;
  facility: Partial<Facility>;
  industry_category_id: number | null;
  industry_category: IndustryCategory | null;
  industry_type_id: number | null;
  industry_type: IndustryType | null;
  industrial_decision_number: string;
  industrial_decision_date: string;
  industrial_decision_type_id: number | null;
  industrial_decision_type: IndustrialDecisionType | null;
  industrial_license_source_id: number | null;
  industrial_license_source: IndustrialLicenseSource | null;
  is_active: boolean;
  created_at: string;
}
