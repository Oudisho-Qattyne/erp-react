import { z } from 'zod';
// cross-field validators: dateAfter, dateOnOrAfter available from dateSchema

export const getCreateLeaveRequestSchema = (t: (key: string, module?: string) => string) =>
  z.object({
    leave_type_id: z.number({ message: t('leave_request.validation.leave_type_required', 'hr') || 'Leave type is required' })
      .positive(t('leave_request.validation.leave_type_required', 'hr') || 'Leave type is required'),
    start_date: z.string().min(1, t('leave_request.validation.start_date_required', 'hr') || 'Start date is required'),
    end_date: z.string().min(1, t('leave_request.validation.end_date_required', 'hr') || 'End date is required'),
    requested_units: z.number().min(1, t('leave_request.validation.requested_units_min', 'hr') || 'Requested units must be at least 1'),
    reason: z.string().min(1, t('leave_request.validation.reason_required', 'hr') || 'Reason is required'),
  }).refine(
    (data) => {
      if (!data.start_date || !data.end_date) return true;
      return data.end_date >= data.start_date;
    },
    { 
      message: t('leave_request.validation.end_date_after_start', 'hr') || 'End date must be on or after start date',
      path: ['end_date'],
    }
  );

export type CreateLeaveRequestFormValues = z.infer<ReturnType<typeof getCreateLeaveRequestSchema>>;
