import { z } from 'zod';

export const getCreateEmployeeSchema = (t: (key: string, module?: string) => string) => {
  const EducationEntrySchema = z.object({
    category: z.enum(['latest', 'previous'],  t('employee_form.validation.category_invalid', 'hr') || 'يجب أن يكون التصنيف "أحدث" أو "سابقة"' ),
    degree_name: z.string().min(1, t('employee_form.validation.degree_name_required', 'hr') || 'اسم الشهادة مطلوب' ),
    university_id: z.number().positive( t('employee_form.validation.university_required', 'hr') || 'رقم الجامعة يجب أن يكون موجباً' ),
    faculty_id: z.number().positive(t('employee_form.validation.faculty_required', 'hr') || 'رقم الكلية يجب أن يكون موجباً' ),
    specialization_id: z.number().positive( t('employee_form.validation.specialization_required', 'hr') || 'رقم التخصص يجب أن يكون موجباً' ),
    graduation_year: z.string().regex(/^\d{4}$/,  t('employee_form.validation.graduation_year_invalid', 'hr') || 'سنة التخرج غير صالحة (يجب أن تكون 4 أرقام)' ),
    academic_stage: z.string().nullable().optional(),
    study_status: z.string().nullable().optional(),
  });

  return z.object({
    // Personal
    internal_id: z.string().min(1,  t('employee_form.validation.internal_id_required', 'hr') || 'الرقم الداخلي مطلوب' ),
    national_id: z.string().min(1,  t('employee_form.validation.national_id_required', 'hr') || 'الرقم الوطني مطلوب' ),
    first_name: z.string().min(1,  t('employee_form.validation.first_name_required', 'hr') || 'الاسم الأول مطلوب' ),
    father_name: z.string().min(1,  t('employee_form.validation.father_name_required', 'hr') || 'اسم الأب مطلوب' ),
    last_name: z.string().min(1,  t('employee_form.validation.last_name_required', 'hr') || 'اسم العائلة مطلوب' ),
    mother_name: z.string().min(1,  t('employee_form.validation.mother_name_required', 'hr') || 'اسم الأم مطلوب' ),
    gender: z.enum(['male', 'female'], t('employee_form.validation.gender_invalid', 'hr') || 'الجنس يجب أن يكون ذكراً أو أنثى'),

    date_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/,  t('employee_form.validation.date_birth_invalid', 'hr') || 'تاريخ الميلاد بصيغة YYYY-MM-DD' ),
    place_birth: z.string().min(1,  t('employee_form.validation.place_birth_required', 'hr') || 'مكان الميلاد مطلوب' ),
    marital_status: z.enum(['single', 'married', 'divorced', 'widowed'], t('employee_form.validation.marital_status_invalid', 'hr') || 'الحالة الاجتماعية غير صالحة' ),
    spouse_name: z.string().optional().default(''),
    spouse_workplace: z.string().optional().default(''),
    blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],  t('employee_form.validation.blood_type_invalid', 'hr') || 'فصيلة الدم غير صالحة' ),
    phone_number: z.string().regex(/^\+?[0-9]{7,15}$/,  t('employee_form.validation.phone_number_invalid', 'hr') || 'رقم الهاتف غير صالح (يجب أن يحتوي على 7-15 رقم، ويمكن أن يبدأ بـ +)' ),
    sham_cash_account: z.string().optional().default(''),
    residence_region_id: z.number().positive( t('employee_form.validation.residence_region_required', 'hr') || 'رقم منطقة السكن يجب أن يكون موجباً' ),
    residential_area_details: z.string().optional(),
    civil_registry_record: z.string().optional(),
    health_status: z.string().optional(),
    injury_details: z.string().nullable().optional(),
    injury_date: z.string().nullable().optional(),

    // Employment (nested)
    employment_details: z.object({
      job_title: z.string().min(1,  t('employee_form.validation.job_title_required', 'hr') || 'المسمى الوظيفي مطلوب' ),
      org_unit_id: z.number().positive( t('employee_form.validation.org_unit_required', 'hr') || 'رقم الوحدة التنظيمية يجب أن يكون موجباً' ),
      status: z.enum(['active', 'inactive', 'terminated', 'on_leave'],  t('employee_form.validation.status_invalid', 'hr') || 'الحالة الوظيفية غير صالحة' ),
      appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/,  t('employee_form.validation.appointment_date_invalid', 'hr') || 'تاريخ التعيين بصيغة YYYY-MM-DD' ),
      contract_type: z.enum(['full-time', 'part-time', 'temporary', 'contract'], t('employee_form.validation.contract_type_invalid', 'hr') || 'نوع العقد غير صالح' ),

      contract_nature: z.enum(['permanent', 'temporary', 'internship'], t('employee_form.validation.contract_nature_invalid', 'hr') || 'طبيعة العقد غير صالحة' ),

      job_category: z.string().min(1,  t('employee_form.validation.job_category_required', 'hr') || 'التصنيف الوظيفي مطلوب' ),
      workplace_city_id: z.number().positive( t('employee_form.validation.workplace_city_required', 'hr') || 'رقم مدينة العمل يجب أن يكون موجباً' ),
    }),

    // Education (array)
    educations: z.array(EducationEntrySchema).default([]),
  });
};

const dummySchema = getCreateEmployeeSchema(() => '');
export type EmployeeFormValues = z.infer<typeof dummySchema>;