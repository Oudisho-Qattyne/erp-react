import { z } from 'zod';

export const getCreateBuildingLicenseFormSchema = (t: (key: string, module?: string) => string) => z.object({
  facility_id: z.number().optional(),
  building_license_number: z.string().min(1, t('building_license.validation.building_license_number_required', 'investments') || 'Building license number is required'),
  building_license_date: z.string().min(1, t('building_license.validation.building_license_date_required', 'investments') || 'Building license date is required'),
  licensed_area: z.number().positive(t('building_license.validation.licensed_area_positive', 'investments') || 'Licensed area must be positive'),
  licensing_status_id: z.number(t('building_license.validation.licensing_status_required', 'investments') || 'Licensing status is required' ).positive(),
  date_of_displaying_license_info: z.string().min(1, t('building_license.validation.date_of_displaying_license_info_required', 'investments') || 'Date of displaying license info is required'),
  administrative_license_decision_number: z.string().min(1, t('building_license.validation.administrative_license_decision_number_required', 'investments') || 'Administrative license decision number is required'),
  administrative_license_decision_date: z.string().min(1, t('building_license.validation.administrative_license_decision_date_required', 'investments') || 'Administrative license decision date is required'),
  by_duration_license_id: z.number( t('building_license.validation.by_duration_license_required', 'investments') || 'Duration license is required' ).positive(),
  by_industry_license_id: z.number(t('building_license.validation.by_industry_license_required', 'investments') || 'Industry license is required' ).positive(),
  temp_administrative_license_expiration_date: z.string().min(1, t('building_license.validation.temp_administrative_license_expiration_date_required', 'investments') || 'Temp license expiration date is required'),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const buildingLicenseFormSchema = getCreateBuildingLicenseFormSchema(dummyT);

export type BuildingLicenseFormData = z.infer<typeof buildingLicenseFormSchema>;
