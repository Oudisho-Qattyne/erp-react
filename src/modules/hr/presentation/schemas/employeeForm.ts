import { z } from 'zod';

const EducationEntrySchema = z.object({
  category: z.enum(['latest', 'previous'], 'يجب أن يكون التصنيف "أحدث" أو "سابقة"' ),
  degree_name: z.string().min(1, { message: 'اسم الشهادة مطلوب' }),
  university_id: z.number().positive({ message: 'رقم الجامعة يجب أن يكون موجباً' }),
  faculty_id: z.number().positive({ message: 'رقم الكلية يجب أن يكون موجباً' }),
  specialization_id: z.number().positive({ message: 'رقم التخصص يجب أن يكون موجباً' }),
  graduation_year: z.string().regex(/^\d{4}$/, { message: 'سنة التخرج غير صالحة (يجب أن تكون 4 أرقام)' }),
  academic_stage: z.string().nullable().optional(),
  study_status: z.string().nullable().optional(),
});

export const CreateEmployeeNestedSchema = z.object({
  // Personal
  internal_id: z.string().min(1, { message: 'الرقم الداخلي مطلوب' }),
  national_id: z.string().min(1, { message: 'الرقم الوطني مطلوب' }),
  first_name: z.string().min(1, { message: 'الاسم الأول مطلوب' }),
  father_name: z.string().min(1, { message: 'اسم الأب مطلوب' }),
  last_name: z.string().min(1, { message: 'اسم العائلة مطلوب' }),
  mother_name: z.string().min(1, { message: 'اسم الأم مطلوب' }),
  gender: z.enum(['male', 'female'], 'الجنس يجب أن يكون ذكراً أو أنثى' ),

  date_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'تاريخ الميلاد بصيغة YYYY-MM-DD' }),
  place_birth: z.string().min(1, { message: 'مكان الميلاد مطلوب' }),
  marital_status: z.enum(['single', 'married', 'divorced', 'widowed'], 'الحالة الاجتماعية غير صالحة' ),
  spouse_name: z.string().optional().default(''),
  spouse_workplace: z.string().optional().default(''),
  blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],  'فصيلة الدم غير صالحة'),
  phone_number: z.string().regex(/^\+?[0-9]{7,15}$/, { message: 'رقم الهاتف غير صالح (يجب أن يحتوي على 7-15 رقم، ويمكن أن يبدأ بـ +)' }),
  sham_cash_account: z.string().optional().default(''),
  residence_region_id: z.number().positive({ message: 'رقم منطقة السكن يجب أن يكون موجباً' }),
  residential_area_details: z.string().optional(),
  civil_registry_record: z.string().optional(),
  health_status: z.string().optional(),
  injury_details: z.string().nullable().optional(),
  injury_date: z.string().nullable().optional(),

  // Employment (nested)
  employment_details: z.object({
    job_title: z.string().min(1, { message: 'المسمى الوظيفي مطلوب' }),
    org_unit_id: z.number().positive({ message: 'رقم الوحدة التنظيمية يجب أن يكون موجباً' }),
    status: z.enum(['active', 'inactive', 'terminated', 'on_leave'],  'الحالة الوظيفية غير صالحة'),
    appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'تاريخ التعيين بصيغة YYYY-MM-DD' }),
    contract_type: z.enum(['full-time', 'part-time', 'temporary', 'contract'],  'نوع العقد غير صالح' ),

    contract_nature: z.enum(['permanent', 'temporary', 'internship'],  'طبيعة العقد غير صالحة' ),

    job_category: z.string().min(1, { message: 'التصنيف الوظيفي مطلوب' }),
    workplace_city_id: z.number().positive({ message: 'رقم مدينة العمل يجب أن يكون موجباً' }),
  }),

  // Education (array)
  educations: z.array(EducationEntrySchema).default([]),
});

export type EmployeeFormValues = z.infer<typeof CreateEmployeeNestedSchema>;