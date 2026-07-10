import { z } from 'zod';

export const getCreateFacilityIndustrialLicenseFormSchema = (t: (key: string, module?: string) => string) => z.object({
  industry_category_id: z.number( t('facility_industrial_licenses.validation.industry_category_required', 'investments') || 'Industry category is required' ),
  industry_type_id: z.number( t('facility_industrial_licenses.validation.industry_type_required', 'investments') || 'Industry type is required' ),
  industrial_decision_number: z.string().min(1, t('facility_industrial_licenses.validation.decision_number_required', 'investments') || 'Decision number is required'),
  industrial_decision_date: z.string().min(1, t('facility_industrial_licenses.validation.decision_date_required', 'investments') || 'Decision date is required'),
  industrial_decision_type_id: z.number( t('facility_industrial_licenses.validation.decision_type_required', 'investments') || 'Decision type is required' ),
  industrial_license_source_id: z.number( t('facility_industrial_licenses.validation.license_source_required', 'investments') || 'License source is required' ),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const facilityIndustrialLicenseFormSchema = getCreateFacilityIndustrialLicenseFormSchema(dummyT);

export type FacilityIndustrialLicenseFormData = z.infer<typeof facilityIndustrialLicenseFormSchema>;
