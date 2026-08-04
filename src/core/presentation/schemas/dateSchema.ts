import { z } from 'zod';

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const iso = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]);
  const dmy = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})/);
  if (dmy) return new Date(+dmy[3], +dmy[2] - 1, +dmy[1]);
  return null;
}

function today(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export const dateString = () => z.string().min(1, 'Date is required');

export const inThePast = (message?: string) =>
  (val: string, ctx: z.RefinementCtx) => {
    const parsed = parseDate(val);
    if (!parsed) return;
    if (parsed > today()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: message || 'Date must be in the past',
      });
    }
  };

export const notInTheFuture = (message?: string) =>
  (val: string, ctx: z.RefinementCtx) => {
    const parsed = parseDate(val);
    if (!parsed) return;
    if (parsed > today()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: message || 'Date cannot be in the future',
      });
    }
  };

export const dateAfter = (smallerField: string, largerField: string, label?: string) =>
  (data: Record<string, unknown>, ctx: z.RefinementCtx) => {
    const smaller = parseDate(data[smallerField] as string);
    const larger = parseDate(data[largerField] as string);
    if (!smaller || !larger) return;
    if (larger <= smaller) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [largerField],
        message: label
          ? `${label} must be after the related date`
          : `${largerField} must be after ${smallerField}`,
      });
    }
  };

export const dateOnOrAfter = (smallerField: string, largerField: string, label?: string) =>
  (data: Record<string, unknown>, ctx: z.RefinementCtx) => {
    const smaller = parseDate(data[smallerField] as string);
    const larger = parseDate(data[largerField] as string);
    if (!smaller || !larger) return;
    if (larger < smaller) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [largerField],
        message: label
          ? `${label} cannot be before the related date`
          : `${largerField} cannot be before ${smallerField}`,
      });
    }
  };

export const notInThePast = (message?: string) =>
  (val: string, ctx: z.RefinementCtx) => {
    const parsed = parseDate(val);
    if (!parsed) return;
    if (parsed < today()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: message || 'Date cannot be in the past',
      });
    }
  };
