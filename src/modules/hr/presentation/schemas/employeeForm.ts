import { z } from 'zod';

export const getCreateEmployeeSchema = (t: (key: string, module?: string) => string) => {
  const EducationEntrySchema = z.object({
    category: z.enum(['initial', 'adjusted', 'latest', 'current'], t('employee_form.validation.category_invalid', 'hr') || 'التصنيف غير صالح'),
    degree_name: z.string().min(1, t('employee_form.validation.degree_name_required', 'hr') || 'اسم الشهادة مطلوب').or(z.literal('')).nullable().optional(),
    university_id: z.number().positive(t('employee_form.validation.university_required', 'hr') || 'رقم الجامعة يجب أن يكون موجباً').nullable().optional(),
    faculty_id: z.number().positive(t('employee_form.validation.faculty_required', 'hr') || 'رقم الكلية يجب أن يكون موجباً').nullable().optional(),
    specialization_id: z.number().positive(t('employee_form.validation.specialization_required', 'hr') || 'رقم التخصص يجب أن يكون موجباً').nullable().optional(),
    graduation_year: z.string().regex(/^\d{4}$/, t('employee_form.validation.graduation_year_invalid', 'hr') || 'سنة التخرج غير صالحة (يجب أن تكون 4 أرقام)').or(z.literal('')).nullable().optional(),
    academic_stage: z.string().or(z.literal('')).nullable().optional(),
    study_status: z.string().or(z.literal('')).nullable().optional(),
  });

  const EmployeeChildren = z.object({
    name: z.string().min(1, t('employee_form.validation.name_invalid', 'hr') || 'اسم الابن مطلوب'),
    birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t('employee_form.validation.birthdate_invalid', 'hr') || 'تاريخ الولادة بصيغة YYYY-MM-DD'),
  })

  const EmployeeSpouse = z.object({
    name: z.string().default('').nullable().optional(),
  })

  return z.object({
    // Personal
    personal_id_number: z.string().nullable().optional(),
    national_id: z.string(t('employee_form.validation.national_id_required', 'hr') || 'الرقم الوطني مطلوب').min(1, t('employee_form.validation.national_id_required', 'hr') || 'الرقم الوطني مطلوب'),
    first_name: z.string(t('employee_form.validation.first_name_required', 'hr') || 'الاسم الأول مطلوب').min(1, t('employee_form.validation.first_name_required', 'hr') || 'الاسم الأول مطلوب'),
    father_name: z.string().min(1, t('employee_form.validation.father_name_required', 'hr') || 'اسم الأب مطلوب').nullable().optional().or(z.literal('')),
    grandfather_name: z.string().min(1, t('employee_form.validation.grandfather_name_required', 'hr') || 'اسم الجد مطلوب').or(z.literal('')).nullable().optional(),
    last_name: z.string(t('employee_form.validation.last_name_required', 'hr') || 'اسم العائلة مطلوب').min(1, t('employee_form.validation.last_name_required', 'hr') || 'اسم العائلة مطلوب'),
    mother_name: z.string().min(1, t('employee_form.validation.mother_name_required', 'hr') || 'اسم الأم مطلوب').or(z.literal('')).nullable().optional(),
    gender: z.enum(['male', 'female'], t('employee_form.validation.gender_invalid', 'hr') || 'الجنس يجب أن يكون ذكراً أو أنثى'),

    date_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t('employee_form.validation.date_birth_invalid', 'hr') || 'تاريخ الميلاد بصيغة YYYY-MM-DD').nullable().optional(),
    place_birth: z.string().min(1, t('employee_form.validation.place_birth_required', 'hr') || 'مكان الميلاد مطلوب').or(z.literal('')).nullable().optional(),
    assigned_job: z.string(t('employee_form.validation.assigned_job_required', 'hr') || 'العمل المكلف به مطلوب').min(1, t('employee_form.validation.assigned_job_required', 'hr') || 'العمل المكلف به مطلوب'),
    marital_status: z.enum(['single', 'married', 'divorced', 'widowed'], t('employee_form.validation.marital_status_invalid', 'hr') || 'الحالة الاجتماعية غير صالحة').nullable(),
    number_of_children: z.number().min(0, t('employee_form.validation.number_of_children_invalid', 'hr') || 'عدد الأولاد يجب أن يكون صفراً أو موجباً').nullable().optional(),
    wives: z.array(EmployeeSpouse).default([]),
    spouse_workplace: z.string().or(z.literal('')).nullable().optional(),
    blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], t('employee_form.validation.blood_type_invalid', 'hr') || 'فصيلة الدم غير صالحة').nullable(),
    phone_number: z.string().regex(/^\+?[0-9]{7,15}$/, t('employee_form.validation.phone_number_invalid', 'hr') || 'رقم الهاتف غير صالح (يجب أن يحتوي على 7-15 رقم، ويمكن أن يبدأ بـ +)').nullable(),
    sham_cash_account: z.string().or(z.literal('')).nullable().optional(),
    country_id: z.number(t('employee_form.validation.country_required', 'hr') || 'الدولة مطلوبة').min(1),
    residence_city_id: z.number(t('employee_form.validation.city_required', 'hr') || 'المدينة مطلوبة').min(1),
    residential_area_details: z.string().or(z.literal('')).nullable().optional(),
    civil_registry_record: z.string().or(z.literal('')).nullable().optional(),
    health_status: z.string().or(z.literal('')).nullable().optional(),
    injury_details: z.string().or(z.literal('')).nullable().optional(),
    injury_date: z.string().or(z.literal('')).nullable().optional(),
    chronic_disease_ids: z.array(z.number()).optional().default([]),

    // Employment (nested)
    employment_details: z.object({
      job_title: z.string().nullable(),
      org_unit_id: z.number(t('employee_form.validation.org_unit_required', 'hr') || 'الوحدة التنظيمية مطلوبة').min(1, t('employee_form.validation.org_unit_required', 'hr') || 'الوحدة التنظيمية مطلوبة'),
      appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t('employee_form.validation.appointment_date_invalid', 'hr') || 'تاريخ التعيين بصيغة YYYY-MM-DD').nullable(),
      job_category: z.string().nullable(),
    }),
    job_status_id: z.number(t('employee_form.validation.job_status_id_required', 'hr') || 'الحالة الوظيفية مطلوبة').min(1, t('employee_form.validation.job_status_id_required', 'hr') || 'الحالة الوظيفية مطلوبة'),
    job_status_note: z.string(t('employee_form.validation.job_status_note_required', 'hr') || 'ملاحظات الحالة الوظيفية مطلوبة').min(1, t('employee_form.validation.job_status_note_required', 'hr') || 'ملاحظات الحالة الوظيفية مطلوبة'),
    employee_status_id: z.number(t('employee_form.validation.employee_status_id_required', 'hr') || 'حالة الموظف مطلوبة').min(1, t('employee_form.validation.employee_status_id_required', 'hr') || 'حالة الموظف مطلوبة'),
    employee_status_note: z.string(t('employee_form.validation.employee_status_note_required', 'hr') || 'ملاحظات حالة الموظف مطلوبة').min(1, t('employee_form.validation.employee_status_note_required', 'hr') || 'ملاحظات حالة الموظف مطلوبة'),

    // Education (array)
    educations: z.array(EducationEntrySchema).default([]),
    children: z.array(EmployeeChildren).default([])
  });
};

const dummySchema = getCreateEmployeeSchema(() => '');
export type EmployeeFormValues = z.infer<typeof dummySchema>;