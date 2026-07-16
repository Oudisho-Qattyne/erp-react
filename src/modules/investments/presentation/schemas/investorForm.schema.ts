import { z } from 'zod';

export const getCreateInvestorFormSchema = (t: (key: string, module?: string) => string) => z.object({
  first_name: z.string().min(1, t('investors.validation.first_name_required', 'investments') || 'First name is required'),
  father_name: z.string().min(1, t('investors.validation.father_name_required', 'investments') || 'Father name is required'),
  grandfather_name: z.string().or(z.literal('')).nullable().optional(),
  last_name: z.string().min(1, t('investors.validation.last_name_required', 'investments') || 'Last name is required'),
  mother_name: z.string().min(1, t('investors.validation.mother_name_required', 'investments') || 'Mother name is required'),
  national_id: z.string().or(z.literal('')).nullable().optional(),
  passport_number: z.string().or(z.literal('')).nullable().optional(),
  nationality: z.string().min(1, t('investors.validation.nationality_required', 'investments') || 'الجنسية مطلوبة'),
  gender: z.enum(['male', 'female'], t('investors.validation.gender_required', 'investments') || 'الجنس مطلوب'),
  phone: z.string().or(z.literal('')).nullable().optional(),
  whatsapp_number: z.string().max(20, t('investors.validation.whatsapp_max', 'investments') || 'يجب ألا يتجاوز رقم الواتساب 20 حرفاً').or(z.literal('')).optional().nullable(),
  email: z.string().email(t('investors.validation.email_invalid', 'investments') || 'Invalid email address').max(255).or(z.literal('')).optional().nullable(),
  address: z.string().max(500, t('investors.validation.address_max', 'investments') || 'يجب ألا يتجاوز العنوان 500 حرف').or(z.literal('')).optional().nullable(),
  facebook: z.url(t('investors.validation.url_invalid', 'investments') || 'رابط غير صالح').or(z.literal('')).optional().nullable(),
  instagram: z.url(t('investors.validation.url_invalid', 'investments') || 'رابط غير صالح').or(z.literal('')).optional().nullable(),
  x: z.url(t('investors.validation.url_invalid', 'investments') || 'رابط غير صالح').or(z.literal('')).optional().nullable(),
  linkedin: z.url(t('investors.validation.url_invalid', 'investments') || 'رابط غير صالح').or(z.literal('')).optional().nullable(),
  is_possible_investor_in_future: z.boolean().default(false),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const investorFormSchema = getCreateInvestorFormSchema(dummyT);

export type InvestorFormData = z.infer<typeof investorFormSchema>;
