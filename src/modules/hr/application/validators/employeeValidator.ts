import { z } from 'zod';
import type { CreateEmployeeDTO, UpdateEmployeeDTO } from '../dtos/employeeDto';

export const getCreateEmployeeSchema = (t: (key: string, module?: string) => string) => {
  const EducationEntrySchema = z.object({
    degree_name: z.string().min(1, t('employee_form.validation.degree_name_required', 'hr') || 'Degree name is required'),
    university_id: z.number().positive(t('employee_form.validation.university_required', 'hr') || 'University ID must be positive'),
    faculty_id: z.number().positive(t('employee_form.validation.faculty_required', 'hr') || 'Faculty ID must be positive'),
    specialization_id: z.number().positive(t('employee_form.validation.specialization_required', 'hr') || 'Specialization ID must be positive'),
    graduation_year: z.string().regex(/^\d{4}$/, t('employee_form.validation.graduation_year_invalid', 'hr') || 'Graduation year must be 4 digits'),
    academic_stage: z.string().or(z.literal('')).nullable().optional(),
    study_status: z.string().or(z.literal('')).nullable().optional(),
  });

  const EmployeeChildren = z.object({
    name: z.string().min(1, t('employee_form.validation.name_invalid', 'hr') || 'Child name is required'),
    birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t('employee_form.validation.birthdate_invalid', 'hr') || 'Birthdate must be YYYY-MM-DD'),
  });

  return z.object({
    personal_id_number: z.string().min(1, t('employee_form.validation.personal_id_number_required', 'hr') || 'Internal ID is required'),
    national_id: z.string().min(1, t('employee_form.validation.national_id_required', 'hr') || 'National ID is required'),
    first_name: z.string().min(1, t('employee_form.validation.first_name_required', 'hr') || 'First name is required'),
    father_name: z.string().min(1, t('employee_form.validation.father_name_required', 'hr') || 'Father name is required'),
    grandfather_name: z.string().min(1, t('employee_form.validation.grandfather_name_required', 'hr') || 'Grandfather name is required'),
    last_name: z.string().min(1, t('employee_form.validation.last_name_required', 'hr') || 'Last name is required'),
    mother_name: z.string().min(1, t('employee_form.validation.mother_name_required', 'hr') || 'Mother name is required'),
    gender: z.enum(['male', 'female'], t('employee_form.validation.gender_invalid', 'hr') || 'Gender must be male or female'),

    date_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t('employee_form.validation.date_birth_invalid', 'hr') || 'Date of birth must be YYYY-MM-DD'),
    place_birth: z.string().min(1, t('employee_form.validation.place_birth_required', 'hr') || 'Place of birth is required'),
    assigned_job: z.string().min(1, t('employee_form.validation.assigned_job_required', 'hr') || 'Assigned job is required'),
    marital_status: z.enum(['single', 'married', 'divorced', 'widowed'], t('employee_form.validation.marital_status_invalid', 'hr') || 'Marital status is invalid'),
    number_of_children: z.number().min(0, t('employee_form.validation.number_of_children_invalid', 'hr') || 'Number of children must be zero or positive'),
    spouses: z.string().optional().default(''),
    spouse_workplace: z.string().optional().default(''),
    blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], t('employee_form.validation.blood_type_invalid', 'hr') || 'Blood type is invalid'),
    phone_number: z.string().regex(/^\+?[0-9]{7,15}$/, t('employee_form.validation.phone_number_invalid', 'hr') || 'Phone number must be 7-15 digits, may start with +'),
    sham_cash_account: z.string().optional().default(''),
    country_id: z.number().optional().default(0),
    residence_city_id: z.number().optional().default(0),
    // residence_region: z.string().or(z.literal('')).nullable().optional(),
    residential_area_details: z.string().optional(),
    civil_registry_record: z.string().optional(),
    health_status: z.string().optional(),
    injury_details: z.string().or(z.literal('')).nullable().optional(),
    injury_date: z.string().or(z.literal('')).nullable().optional(),
    chronic_disease_ids: z.array(z.number()).optional().default([]),

    employment_details: z.object({
      job_title: z.string().min(1, t('employee_form.validation.job_title_required', 'hr') || 'Job title is required'),
      org_unit_id: z.number().min(0).default(0),
      status: z.enum(['active', 'inactive', 'terminated', 'on_leave'], t('employee_form.validation.status_invalid', 'hr') || 'Employment status is invalid'),
      appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t('employee_form.validation.appointment_date_invalid', 'hr') || 'Appointment date must be YYYY-MM-DD'),
      job_category: z.string().min(1, t('employee_form.validation.job_category_required', 'hr') || 'Job category is required'),
    }),

    educations: z.array(EducationEntrySchema).default([]),
    children: z.array(EmployeeChildren).default([]),
  });
};

const dummySchema = getCreateEmployeeSchema(() => '');
export type EmployeeFormValues = z.infer<typeof dummySchema>;

export const createEmployeeValidator = async (data: CreateEmployeeDTO | UpdateEmployeeDTO): Promise<void> => {
  const schema = getCreateEmployeeSchema((key: string) => key);
  await schema.parseAsync(data);
};