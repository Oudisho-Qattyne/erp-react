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
    });

export const getCreateFacilityFormSchema = (t: (key: string, module?: string) => string) => z.object({
  name: z.string().min(1, t('facilities.validation.name_required', 'investments') || 'Name is required'),
  partnership_type_id: z.number( t('facilities.validation.partnership_type_required', 'investments') || 'Partnership type is required' ),
  address: z.string().min(1, t('facilities.validation.address_required', 'investments') || 'Address is required'),
  city: z.string().min(1, t('facilities.validation.city_required', 'investments') || 'City is required'),
  first_phone_number: z.string().min(1, t('facilities.validation.first_phone_number_required', 'investments') || 'Phone is required'),
  second_phone_number: z.string().optional().nullable(),
  email: z.string().email(t('facilities.validation.email_invalid', 'investments') || 'Invalid email address').optional().nullable().or(z.literal('')),
  capital_in_usd: z.number().positive(t('facilities.validation.capital_in_usd_positive', 'investments') || 'Must be positive'),
  capital_in_syp: z.number().positive(t('facilities.validation.capital_in_syp_positive', 'investments') || 'Must be positive'),
  value_of_machines_in_usd: z.number().positive(t('facilities.validation.value_of_machines_in_usd_positive', 'investments') || 'Must be positive'),
  value_of_machines_in_syp: z.number().positive(t('facilities.validation.value_of_machines_in_syp_positive', 'investments') || 'Must be positive'),
  number_of_workers: z.number().positive(t('facilities.validation.number_of_workers_positive', 'investments') || 'Must be positive').int(),
  daily_production_capacity: z.number().positive(t('facilities.validation.daily_production_capacity_positive', 'investments') || 'Must be positive'),
  monthly_production_capacity: z.number().positive(t('facilities.validation.monthly_production_capacity_positive', 'investments') || 'Must be positive'),
  yearly_production_capacity: z.number().positive(t('facilities.validation.yearly_production_capacity_positive', 'investments') || 'Must be positive'),
  electrical_power_capacity: z.string().min(1, t('facilities.validation.electrical_power_capacity_required', 'investments') || 'Required'),
  yearly_estimated_water_consumption: z.number().positive(t('facilities.validation.yearly_estimated_water_consumption_positive', 'investments') || 'Must be positive'),
  authorized_persons: z.array(getAuthorizedPersonSchema(t)).optional(),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const facilityFormSchema = getCreateFacilityFormSchema(dummyT);

export type FacilityFormData = z.infer<typeof facilityFormSchema>;
