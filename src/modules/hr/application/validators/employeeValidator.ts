import { z } from 'zod';
import type { CreateEmployeeDTO, UpdateEmployeeDTO } from '../dtos/employeeDto';

// Define the Zod schema for CreateEmployeeDTO
export const createEmployeeSchema = z.object({
  internal_id: z.string().min(1, 'Internal ID is required'),
  national_id: z.string().min(1, 'National ID is required'),
  first_name: z.string().min(1, 'First name is required'),
  father_name: z.string().min(1, 'Father name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  mother_name: z.string().min(1, 'Mother name is required'),
  gender: z.enum(['male', 'female']),
  date_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  place_birth: z.string().min(1),
  marital_status: z.enum(['single', 'married', 'divorced', 'widowed']),
  spouse_name: z.string().optional().default(''),
  spouse_workplace: z.string().optional().default(''),
  blood_type: z.string().optional(),
  phone_number: z.string().regex(/^\+?\d{7,15}$/, 'Invalid phone number'),
  sham_cash_account: z.string().optional(),
  residence_region_id: z.number().positive(),
  residential_area_details: z.string().optional(),
  civil_registry_record: z.string().optional(),
  health_status: z.string().optional(),
  injury_details: z.string().nullable(),
  injury_date: z.string().nullable(),
  employment_details: z.object({
    job_title: z.string().min(1),
    org_unit_id: z.number().positive(),
    status: z.string().min(1),
    appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    contract_type: z.string().min(1),
    contract_nature: z.string().min(1),
    job_category: z.string().min(1),
    workplace_city_id: z.number().positive(),
  }),
  educations: z.array(z.object({
    category: z.string(),
    degree_name: z.string(),
    university_id: z.number().positive(),
    faculty_id: z.number().positive(),
    specialization_id: z.number().positive(),
    graduation_year: z.string().regex(/^\d{4}$/),
    academic_stage: z.string().nullable(),
    study_status: z.string().nullable(),
  })),
});

export const createEmployeeValidator = async (data: CreateEmployeeDTO | UpdateEmployeeDTO): Promise<void> => {
  await createEmployeeSchema.parseAsync(data);
};