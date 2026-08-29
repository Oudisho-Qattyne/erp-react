import { z } from 'zod';
import { notInTheFuture } from '../../../../core/presentation/schemas/dateSchema';

export const getCreateDossierSchema = (t: (key: string, module?: string) => string) => z.object({
  dossier_number: z.string().min(1, t('dossier.validation.number_required', 'investments') || 'رقم الإضبارة مطلوب'),
  dossier_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t('dossier.validation.date_format', 'investments') || 'التاريخ بصيغة YYYY-MM-DD').superRefine(notInTheFuture(t('dossier.validation.date_future', 'investments') || 'التاريخ لا يمكن أن يكون في المستقبل')),
  status: z.enum(['draft', 'pending_subscription_fee', 'subscription_fee_paid', 'allocatable', 'active', 'subscription_approved', 'cancelled'], t('dossier.validation.status_required', 'investments') || 'الحالة مطلوبة' ),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const dossierSchema = getCreateDossierSchema(dummyT);

export type DossierFormData = z.infer<typeof dossierSchema>;
