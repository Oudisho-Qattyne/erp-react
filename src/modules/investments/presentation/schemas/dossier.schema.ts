import { z } from 'zod';

export const getCreateDossierSchema = (t: (key: string, module?: string) => string) => z.object({
  dossier_number: z.string().min(1, t('dossier.validation.number_required', 'investments') || 'رقم الملف مطلوب'),
  dossier_date: z.string().min(1, t('dossier.validation.date_required', 'investments') || 'التاريخ مطلوب'),
  status: z.enum(['draft', 'active', 'allocatable' , 'cancelled'], t('dossier.validation.status_required', 'investments') || 'الحالة مطلوبة' ),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const dossierSchema = getCreateDossierSchema(dummyT);

export type DossierFormData = z.infer<typeof dossierSchema>;
