import { z } from 'zod';

export const getCreateLeaveSchema = (t: (key: string, module?: string) => string) => {
  const GrantSchema = z.object({
    value: z.number().min(0, t('leave.validation.grant_value_min', 'hr') || 'يجب أن تكون قيمة المنحة 0 أو أكثر'),
    unit: z.enum(['day', 'hour'], t('leave.validation.grant_unit_invalid', 'hr') || 'يجب أن تكون وحدة المنحة يوم أو ساعة'),
  });

  const RuleConditionSchema = z.object({
    type: z.literal('condition'),
    field: z.string().min(1, t('leave.validation.rule_field_required', 'hr') || 'حقل الشرط مطلوب'),
    operator: z.enum(['=', '!=', '>', '>=', '<', '<=', 'in', 'between', 'contains'], t('leave.validation.rule_operator_invalid', 'hr') || 'عامل المقارنة غير صالح'),
    value: z.string(),
  });

  type RuleGroupType = z.infer<typeof RuleConditionSchema> | { type: 'group'; operator: 'AND' | 'OR'; conditions: any[] };
  const RuleGroupSchema: z.ZodType<RuleGroupType[]> = z.lazy(() =>
    z.array(z.union([
      RuleConditionSchema,
      z.object({
        type: z.literal('group'),
        operator: z.enum(['AND', 'OR'], t('leave.validation.rule_group_operator_invalid', 'hr') || 'عامل المجموعة غير صالح'),
        conditions: RuleGroupSchema,
      }),
    ]))
  );

  const RuleGroupContainerSchema = z.object({
    type: z.literal('group'),
    operator: z.enum(['AND', 'OR'], t('leave.validation.rule_group_operator_invalid', 'hr') || 'عامل المجموعة غير صالح'),
    conditions: RuleGroupSchema,
  });

  const BandSchema = z.object({
    rule: RuleGroupContainerSchema,
    grant: GrantSchema,
  });

  const BandCaseSchema = z.object({
    type: z.literal('bands'),
    bands: z.array(BandSchema).min(1, t('leave.validation.bands_min', 'hr') || 'يجب وجود نطاق واحد على الأقل'),
  });

  const FixedGrantCaseSchema = z.object({
    type: z.literal('fixed'),
    grant: GrantSchema,
  });

  const EntitlementRulesSchema = z.discriminatedUnion('type', [
    BandCaseSchema,
    FixedGrantCaseSchema,
  ]);

  const ProportionRulesSchema = z.object({
    basis: z.enum(['hire_date', 'custom_date'], t('leave.validation.proportion_basis_invalid', 'hr') || 'أساس التناسب غير صالح').nullable().optional(),
    calculation: z.enum(['monthly_started', 'monthly_completed', 'daily'], t('leave.validation.proportion_calculation_invalid', 'hr') || 'حساب التناسب غير صالح').nullable().optional(),
    rounding: z.enum(['none', 'floor', 'ceil', 'half'], t('leave.validation.proportion_rounding_invalid', 'hr') || 'تقريب التناسب غير صالح').nullable().optional(),
  });

  return z.object({
    name: z.string().min(1, t('leave.validation.name_required', 'hr') || 'اسم الإجازة مطلوب'),
    description: z.string().min(1, t('leave.validation.description_required', 'hr') || 'الوصف مطلوب'),
    unit: z.enum(['day', 'hour'], t('leave.validation.unit_invalid', 'hr') || 'يجب أن تكون الوحدة يوم أو ساعة'),
    is_paid: z.boolean(),
    requires_attachment: z.boolean(),
    requires_approval: z.boolean(),
    allow_half_day: z.boolean(),
    allow_hourly: z.boolean(),
    allow_split: z.boolean(),
    min_request_units: z.number().min(0, t('leave.validation.min_request_units_min', 'hr') || 'الحد الأدنى لوحدات الطلب يجب أن يكون 0 أو أكثر'),
    max_request_units: z.number().min(0, t('leave.validation.max_request_units_min', 'hr') || 'الحد الأقصى لوحدات الطلب يجب أن يكون 0 أو أكثر'),
    balance_mode: z.enum(['accrual', 'fixed_grant', 'once_per_life', 'once_per_service', 'none'], t('leave.validation.balance_mode_invalid', 'hr') || 'نمط الرصيد غير صالح'),
    accrual_period: z.enum(['yearly', 'monthly', 'none']).optional(),
    allow_carry_forward: z.boolean(),
    carry_forward_limit: z.number().min(0).nullable().optional(),
    eligibility_rules: RuleGroupContainerSchema,
    entitlement_rules: EntitlementRulesSchema,
    proration_rules: ProportionRulesSchema.nullable().optional(),
    is_active: z.boolean(),
  });
};

const dummySchema = getCreateLeaveSchema(() => '');
export type LeaveFormValues = z.infer<typeof dummySchema>;
