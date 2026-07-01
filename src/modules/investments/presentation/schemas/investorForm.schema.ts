import { z } from 'zod';

export const investorFormSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  national_id: z.string().nullable().optional(),
  passport_number: z.string().nullable().optional(),
  nationality: z.string().min(1, 'Nationality is required'),
  gender: z.enum(['male', 'female'], 'Gender is required' ),
  phone: z.string().nullable().optional(),
  whatsapp_number: z.string().max(20).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  is_possible_investor_in_future: z.boolean().default(false),
});

export type InvestorFormData = z.infer<typeof investorFormSchema>;
