import { z } from 'zod';
import { notInTheFuture } from '../../../../core/presentation/schemas/dateSchema';

export const getCreateFacilityIndustrialLicenseFormSchema = (t: (key: string, module?: string) => string) => z.object({
  industry_category_id: z.number( t('facility_industrial_licenses.validation.industry_category_required', 'investments') || 'Industry category is required' ),
  industry_type_id: z.number( t('facility_industrial_licenses.validation.industry_type_required', 'investments') || 'Industry type is required' ),
  industrial_decision_number: z.string().min(1, t('facility_industrial_licenses.validation.decision_number_required', 'investments') || 'Decision number is required'),
  industrial_decision_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t('facility_industrial_licenses.validation.decision_date_format', 'investments') || 'Decision date must be YYYY-MM-DD').superRefine(notInTheFuture(t('facility_industrial_licenses.validation.decision_date_future', 'investments') || 'Decision date cannot be in the future')),
  industrial_decision_type_id: z.number( t('facility_industrial_licenses.validation.decision_type_required', 'investments') || 'Decision type is required' ),
  industrial_license_source_id: z.number( t('facility_industrial_licenses.validation.license_source_required', 'investments') || 'License source is required' ),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const facilityIndustrialLicenseFormSchema = getCreateFacilityIndustrialLicenseFormSchema(dummyT);

export type FacilityIndustrialLicenseFormData = z.infer<typeof facilityIndustrialLicenseFormSchema>;
