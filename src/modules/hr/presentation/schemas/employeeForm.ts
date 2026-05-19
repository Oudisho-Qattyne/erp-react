import { z } from 'zod';

const EducationEntrySchema = z.object({
  category: z.enum(['latest', 'previous']),
  degree_name: z.string().min(1, 'اسم الشهادة مطلوب'),
  university_id: z.number().positive(),
  faculty_id: z.number().positive(),
  specialization_id: z.number().positive(),
  graduation_year: z.string().regex(/^\d{4}$/, 'سنة التخرج غير صالحة'),
  academic_stage: z.string().nullable().optional(),
  study_status: z.string().nullable().optional(),
});

export const CreateEmployeeNestedSchema = z.object({
  // Personal
  internal_id: z.string().min(1, 'الرقم الداخلي مطلوب'),
  national_id: z.string().min(1, 'الرقم الوطني مطلوب'),
  first_name: z.string().min(1, 'الاسم الأول مطلوب'),
  father_name: z.string().min(1, 'اسم الأب مطلوب'),
  last_name: z.string().min(1, 'اسم العائلة مطلوب'),
  mother_name: z.string().min(1, 'اسم الأم مطلوب'),
  gender: z.enum(['male', 'female']),
  date_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'التاريخ بصيغة YYYY-MM-DD'),
  place_birth: z.string().min(1),
  marital_status: z.enum(['single', 'married', 'divorced', 'widowed']),
  spouse_name: z.string().optional().default(''),
  spouse_workplace: z.string().optional().default(''),
  blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  phone_number: z.string().regex(/^\+?[0-9]{7,15}$/, 'رقم الهاتف غير صالح'),
  sham_cash_account: z.string().optional().default(''),
  residence_region_id: z.number().positive(),
  residential_area_details: z.string().optional(),
  civil_registry_record: z.string().optional(),
  health_status: z.string().optional(),
  injury_details: z.string().nullable().optional(),
  injury_date: z.string().nullable().optional(),

  // Employment (nested)
  employment_details: z.object({
    job_title: z.string().min(1),
    org_unit_id: z.number().positive(),
    status: z.enum(['active', 'inactive', 'terminated', 'on_leave']),
    appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    contract_type: z.enum(['full-time', 'part-time', 'temporary', 'contract']),
    contract_nature: z.enum(['permanent', 'temporary', 'internship']),
    job_category: z.string().min(1),
    workplace_city_id: z.number().positive(),
  }),

  // Education (array)
  educations: z.array(EducationEntrySchema).default([]),
});

export type EmployeeFormValues = z.infer<typeof CreateEmployeeNestedSchema>;