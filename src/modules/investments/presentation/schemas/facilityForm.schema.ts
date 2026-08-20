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
    id: z.number(t('facilities.validation.consumption_material_required', 'investments') || 'Consumption material is required'),
    consumption: z.preprocess(
      (v) => (v === undefined || v === null ? '' : String(v)),
      z.string().min(1, t('facilities.validation.consumption_value_required', 'investments') || 'Consumption is required')
    ),
    unit: z.string().optional(),
  });

export const getCreateFacilityFormSchema = (t: (key: string, module?: string) => string) => z.object({
  name: z.string().min(1, t('facilities.validation.name_required', 'investments') || 'Name is required'),
  partnership_type_id: z.number( t('facilities.validation.partnership_type_required', 'investments') || 'Partnership type is required' ),
  address: z.string().min(1, t('facilities.validation.address_required', 'investments') || 'Address is required'),
  company_type: z.string().min(1, t('facilities.validation.company_type_required', 'investments') || 'Company type is required'),
  commercial_register: z.string().optional().nullable(),
  commercial_register_date: z.string().optional().nullable(),
  company_nationality_id: z.number(t('facilities.validation.company_nationality_required', 'investments') || 'Company nationality is required'),
  first_phone_number: z.string().min(1, t('facilities.validation.first_phone_number_required', 'investments') || 'Phone is required'),
  second_phone_number: z.string().optional().nullable(),
  email: z.string().email(t('facilities.validation.email_invalid', 'investments') || 'Invalid email address').optional().nullable().or(z.literal('')),
  total_capital_in_usd: z.number().positive(t('facilities.validation.total_capital_in_usd_positive', 'investments') || 'Must be positive'),
  total_capital_in_syp: z.number().positive(t('facilities.validation.total_capital_in_syp_positive', 'investments') || 'Must be positive'),
  value_of_machines_in_usd: z.number().positive(t('facilities.validation.value_of_machines_in_usd_positive', 'investments') || 'Must be positive'),
  value_of_machines_in_syp: z.number().positive(t('facilities.validation.value_of_machines_in_syp_positive', 'investments') || 'Must be positive'),
  number_of_workers: z.number().min(0 , t('facilities.validation.number_of_workers_positive', 'investments') || 'Must be positive').int(),
  number_or_patrols: z.number().min(0 , t('facilities.validation.number_or_patrols_integer', 'investments') || 'Must be an integer').optional().nullable(),
  telephone_lines_number: z.number().min(0 , t('facilities.validation.telephone_lines_number_positive', 'investments') || 'Must be a positive number').optional().nullable(),
  monthly_internet_data_requirement: z.number().min(0 , t('facilities.validation.monthly_internet_data_requirement_positive', 'investments') || 'Must be a positive number').optional().nullable(),
  yearly_imported_raw_materials: z.string().optional().nullable(),
  export_to_production_ratio: z.number()
    .min(0, t('facilities.validation.export_to_production_ratio_range', 'investments') || 'Must be between 0 and 100')
    .max(100, t('facilities.validation.export_to_production_ratio_range', 'investments') || 'Must be between 0 and 100')
    .optional().nullable(),
  daily_production_capacities: z.array(getProductionMatrixRowSchema(t)).optional(),
  monthly_production_capacities: z.array(getProductionMatrixRowSchema(t)).optional(),
  yearly_production_capacities: z.array(getProductionMatrixRowSchema(t)).min(1, t('facilities.validation.yearly_production_capacities_required', 'investments') || 'At least one row is required'),
  daily_consumption: z.array(getDailyConsumptionRowSchema(t)).optional(),
  electrical_power_capacity: z.string().min(1, t('facilities.validation.electrical_power_capacity_required', 'investments') || 'Required'),
  yearly_estimated_drinking_water_consumption: z.number().min(0 ,t('facilities.validation.yearly_estimated_drinking_water_consumption_positive', 'investments') || 'Must be positive'),
  yearly_estimated_industrial_water_consumption: z.number().min(0 ,t('facilities.validation.yearly_estimated_industrial_water_consumption_positive', 'investments') || 'Must be positive'),
  authorized_persons: z.array(getAuthorizedPersonSchema(t)).optional(),
  require_all_persons_for_legal_matters: z.boolean().optional().default(true),
}).superRefine((data, ctx) => {
  if (data.company_type === 'existing') {
    if (!data.commercial_register?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['commercial_register'],
        message: t('facilities.validation.commercial_register_required', 'investments') || 'Commercial Register is required',
      });
    }
    if (!data.commercial_register_date?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['commercial_register_date'],
        message: t('facilities.validation.commercial_register_date_required', 'investments') || 'Commercial Register Date is required',
      });
    }
  }
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const facilityFormSchema = getCreateFacilityFormSchema(dummyT);

export type FacilityFormData = z.infer<typeof facilityFormSchema>;
