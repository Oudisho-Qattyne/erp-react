import { z } from 'zod';

export const getCreateFacilityFormSchema = (t: (key: string, module?: string) => string) => z.object({
  name: z.string().min(1, t('facilities.validation.name_required', 'investments') || 'Name is required'),
  address: z.string().min(1, t('facilities.validation.address_required', 'investments') || 'Address is required'),
  city: z.string().min(1, t('facilities.validation.city_required', 'investments') || 'City is required'),
  phone1: z.string().min(1, t('facilities.validation.phone1_required', 'investments') || 'Phone is required'),
  phone2: z.string().optional().nullable(),
  email: z.string().email(t('facilities.validation.email_invalid', 'investments') || 'Invalid email').optional().nullable().or(z.literal('')),
  capitalSYP: z.number().positive().optional().nullable(),
  capitalUSD: z.number().positive().optional().nullable(),
  machineryValueSYP: z.number().positive().optional().nullable(),
  machineryValueUSD: z.number().positive().optional().nullable(),
  employeeCount: z.number().positive().int().optional().nullable(),
  dailyProductionCapacity: z.number().positive().optional().nullable(),
  monthlyProductionCapacity: z.number().positive().optional().nullable(),
  annualProductionCapacity: z.number().positive().optional().nullable(),
  powerCapacity: z.string().optional().nullable(),
  waterConsumption: z.union([z.number().positive(), z.string()]).optional().nullable(),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const facilityFormSchema = getCreateFacilityFormSchema(dummyT);

export type FacilityFormData = z.infer<typeof facilityFormSchema>;
