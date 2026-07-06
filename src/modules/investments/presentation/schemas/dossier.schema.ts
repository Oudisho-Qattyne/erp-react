import { z } from 'zod';

export const getCreateDossierSchema = (t: (key: string, module?: string) => string) => z.object({
  number: z.string().or(z.literal('')).optional(),
  date: z.string().min(1, t('dossier.validation.date_required', 'investments') || 'التاريخ مطلوب'),
  status: z.enum(['draft', 'canceled', 'active'], t('dossier.validation.status_required', 'investments') || 'الحالة مطلوبة' ),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const dossierSchema = getCreateDossierSchema(dummyT);

export type DossierFormData = z.infer<typeof dossierSchema>;
