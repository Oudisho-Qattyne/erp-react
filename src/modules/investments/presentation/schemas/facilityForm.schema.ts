import { z } from 'zod';

export const getAuthorizedPersonSchema = (t: (key: string, module?: string) => string) =>
  z
    .object({
      person: z
        .object({
          id: z.number().int().optional(),
          name: z
            .string()
            .min(1, t('facilities.validation.authorized_person_name_required', 'investments') || 'Person name is required')
            .optional(),
          email: z
            .string()
            .email(t('facilities.validation.email_invalid', 'investments') || 'Invalid email address')
            .optional()
            .nullable(),
          primary_phone_number: z.string().optional().nullable(),
          whatsapp: z.string().optional().nullable(),
          facebook: z.string().optional().nullable(),
        })
        .refine(
          (p) => p.id !== undefined || (p.name !== undefined && p.name.trim().length > 0),
          {
            message:
              t('facilities.validation.authorized_person_identity_required', 'investments') ||
              'Provide a person name or select an existing person',
          }
        ),
      role_in_facility: z.string().optional(),
      is_required_for_legal_matters: z.boolean().optional(),
    })
    .refine(
      (entry) => {
        const hasPerson =
          entry.person.id !== undefined ||
          (entry.person.name !== undefined && entry.person.name.trim().length > 0);
        if (!hasPerson) return true;
        return !!entry.role_in_facility?.trim();
      },
      {
        message:
          t('facilities.validation.authorized_person_role_required', 'investments') ||
          'Role in Facility is required',
        path: ['role_in_facility'],
      }
    );

export const getProductionMatrixRowSchema = (t: (key: string, module?: string) => string) =>
  z.object({
    material: z.string().min(1, t('facilities.validation.material_required', 'investments') || 'Material is required'),
    production: z.string().min(1, t('facilities.validation.production_required', 'investments') || 'Production is required'),
  });

export const getDailyConsumptionRowSchema = (t: (key: string, module?: string) => string) =>
  z.object({
    material: z.number(t('facilities.validation.consumption_material_required', 'investments') || 'Consumption material is required'),
    consumption: z.string().min(1, t('facilities.validation.consumption_value_required', 'investments') || 'Consumption is required'),
    unit: z.string().optional(),
  });

export const getCreateFacilityFormSchema = (t: (key: string, module?: string) => string) => z.object({
  name: z.string().min(1, t('facilities.validation.name_required', 'investments') || 'Name is required'),
  partnership_type_id: z.number( t('facilities.validation.partnership_type_required', 'investments') || 'Partnership type is required' ),
  address: z.string().min(1, t('facilities.validation.address_required', 'investments') || 'Address is required'),
  company_status: z.string().min(1, t('facilities.validation.company_status_required', 'investments') || 'Company status is required'),
  commercial_registry: z.string().optional().nullable(),
  commercial_registry_date: z.string().optional().nullable(),
  company_nationality_id: z.number(t('facilities.validation.company_nationality_required', 'investments') || 'Company nationality is required'),
  first_phone_number: z.string().optional().nullable(),
  second_phone_number: z.string().optional().nullable(),
  email: z.string().email(t('facilities.validation.email_invalid', 'investments') || 'Invalid email address').optional().nullable().or(z.literal('')),
  capital_in_usd: z.number().positive(t('facilities.validation.capital_in_usd_positive', 'investments') || 'Must be positive'),
  capital_in_syp: z.number().positive(t('facilities.validation.capital_in_syp_positive', 'investments') || 'Must be positive'),
  value_of_machines_in_usd: z.number().positive(t('facilities.validation.value_of_machines_in_usd_positive', 'investments') || 'Must be positive'),
  value_of_machines_in_syp: z.number().positive(t('facilities.validation.value_of_machines_in_syp_positive', 'investments') || 'Must be positive'),
  number_of_workers: z.number().min(0 , t('facilities.validation.number_of_workers_positive', 'investments') || 'Must be positive').int(),
  number_of_patrols: z.number().min(0 , t('facilities.validation.number_of_patrols_integer', 'investments') || 'Must be an integer').optional().nullable(),
  number_of_phone_lines: z.number().min(0 , t('facilities.validation.number_of_phone_lines_positive', 'investments') || 'Must be a positive number').optional().nullable(),
  internet_need_monthly_gb: z.number().min(0 , t('facilities.validation.internet_need_monthly_gb_positive', 'investments') || 'Must be a positive number').optional().nullable(),
  imported_raw_materials_annually: z.string().optional().nullable(),
  export_percentage: z.number()
    .min(0, t('facilities.validation.export_percentage_range', 'investments') || 'Must be between 0 and 100')
    .max(100, t('facilities.validation.export_percentage_range', 'investments') || 'Must be between 0 and 100')
    .optional().nullable(),
  daily_production_capacity: z.array(getProductionMatrixRowSchema(t)).optional(),
  monthly_production_capacity: z.array(getProductionMatrixRowSchema(t)).optional(),
  yearly_production_capacity: z.array(getProductionMatrixRowSchema(t)).min(1, t('facilities.validation.yearly_production_capacity_required', 'investments') || 'At least one row is required'),
  daily_consumption_volume: z.array(getDailyConsumptionRowSchema(t)).optional(),
  electrical_power_capacity: z.string().min(1, t('facilities.validation.electrical_power_capacity_required', 'investments') || 'Required'),
  yearly_estimated_water_consumption: z.number().positive(t('facilities.validation.yearly_estimated_water_consumption_positive', 'investments') || 'Must be positive'),
  authorized_persons: z.array(getAuthorizedPersonSchema(t)).optional(),
  require_all_persons_for_legal_matters: z.boolean().optional().default(true),
}).superRefine((data, ctx) => {
  if (data.company_status === 'established') {
    if (!data.commercial_registry?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['commercial_registry'],
        message: t('facilities.validation.commercial_registry_required', 'investments') || 'Commercial Registry is required',
      });
    }
    if (!data.commercial_registry_date?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['commercial_registry_date'],
        message: t('facilities.validation.commercial_registry_date_required', 'investments') || 'Commercial Registry Date is required',
      });
    }
  }
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const facilityFormSchema = getCreateFacilityFormSchema(dummyT);

export type FacilityFormData = z.infer<typeof facilityFormSchema>;
