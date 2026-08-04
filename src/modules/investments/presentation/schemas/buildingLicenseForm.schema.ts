import { z } from 'zod';
import { notInTheFuture, notInThePast } from '../../../../core/presentation/schemas/dateSchema';

const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

export const getCreateBuildingLicenseFormSchema = (t: (key: string, module?: string) => string) => z.object({
  facility_id: z.number().optional(),
  building_license_number: z.string().min(1, t('building_license.validation.building_license_number_required', 'investments') || 'Building license number is required'),
  building_license_date: z.string().regex(dateFormatRegex, t('building_license.validation.building_license_date_format', 'investments') || 'Building license date must be YYYY-MM-DD').superRefine(notInTheFuture(t('building_license.validation.building_license_date_future', 'investments') || 'Building license date cannot be in the future')),
  licensed_area: z.number().positive(t('building_license.validation.licensed_area_positive', 'investments') || 'Licensed area must be positive'),
  licensing_status_id: z.number(t('building_license.validation.licensing_status_required', 'investments') || 'Licensing status is required' ).positive(),
  date_of_displaying_license_info: z.string().regex(dateFormatRegex, t('building_license.validation.date_of_displaying_license_info_format', 'investments') || 'Date of displaying license info must be YYYY-MM-DD').superRefine(notInTheFuture(t('building_license.validation.date_of_displaying_license_info_future', 'investments') || 'Display date cannot be in the future')),
  administrative_license_decision_number: z.string().min(1, t('building_license.validation.administrative_license_decision_number_required', 'investments') || 'Administrative license decision number is required'),
  administrative_license_decision_date: z.string().regex(dateFormatRegex, t('building_license.validation.administrative_license_decision_date_format', 'investments') || 'Decision date must be YYYY-MM-DD').superRefine(notInTheFuture(t('building_license.validation.administrative_license_decision_date_future', 'investments') || 'Decision date cannot be in the future')),
  by_duration_license_id: z.number( t('building_license.validation.by_duration_license_required', 'investments') || 'Duration license is required' ).positive(),
  by_industry_license_id: z.number(t('building_license.validation.by_industry_license_required', 'investments') || 'Industry license is required' ).positive(),
  temp_administrative_license_expiration_date: z.string().regex(dateFormatRegex, t('building_license.validation.temp_administrative_license_expiration_date_format', 'investments') || 'Expiration date must be YYYY-MM-DD').superRefine(notInThePast(t('building_license.validation.temp_administrative_license_expiration_date_past', 'investments') || 'Expiration date cannot be in the past')),
}).refine(
  (data) => {
    if (!data.temp_administrative_license_expiration_date || !data.administrative_license_decision_date) return true;
    return data.temp_administrative_license_expiration_date > data.administrative_license_decision_date;
  },
  {
    message: t('building_license.validation.expiration_after_decision', 'investments') || 'Expiration date must be after the administrative decision date',
    path: ['temp_administrative_license_expiration_date'],
  }
).refine(
  (data) => {
    if (!data.temp_administrative_license_expiration_date || !data.building_license_date) return true;
    return data.temp_administrative_license_expiration_date > data.building_license_date;
  },
  {
    message: t('building_license.validation.expiration_after_license', 'investments') || 'Expiration date must be after the building license date',
    path: ['temp_administrative_license_expiration_date'],
  }
).refine(
  (data) => {
    if (!data.administrative_license_decision_date || !data.building_license_date) return true;
    return data.administrative_license_decision_date >= data.building_license_date;
  },
  {
    message: t('building_license.validation.decision_after_license', 'investments') || 'Decision date must be on or after the building license date',
    path: ['administrative_license_decision_date'],
  }
).refine(
  (data) => {
    if (!data.date_of_displaying_license_info || !data.building_license_date) return true;
    return data.date_of_displaying_license_info >= data.building_license_date;
  },
  {
    message: t('building_license.validation.display_after_license', 'investments') || 'Display date must be on or after the building license date',
    path: ['date_of_displaying_license_info'],
  }
);

const dummyT = (() => '') as (key: string, module?: string) => string;
export const buildingLicenseFormSchema = getCreateBuildingLicenseFormSchema(dummyT);

export type BuildingLicenseFormData = z.infer<typeof buildingLicenseFormSchema>;
