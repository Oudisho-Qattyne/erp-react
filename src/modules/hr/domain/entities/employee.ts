// -----------------------------------------------------------------------------
// Enums for better type safety (optional but recommended)

import type { Faculty } from "../../../../core/domain/entities/education/Faculty";
import type { Specialization } from "../../../../core/domain/entities/education/Specialization";
import type { University } from "../../../../core/domain/entities/education/University";
import type { Region } from "../../../../core/domain/entities/regions/Region";
import type { City } from "../../../../core/domain/entities/regions/City";
import type { Country } from "../../../../core/domain/entities/regions/Country";
import type { BloodType } from "../../../../core/domain/valueObjects/BloodType";
import type { EducationCategory } from "../../../../core/domain/valueObjects/EducationCategory";
import type { Gender } from "../../../../core/domain/valueObjects/Gender";
import type { MaritalStatus } from "../../../../core/domain/valueObjects/MaritalStatus";
import type { ContractNature } from "../valueObjects/ContractNature";
import type { ContractType } from "../valueObjects/ContractType";
import type { EmploymentStatus } from "../valueObjects/EmploymentStatus";
import type { ChronicDiseases } from "../../../../core/domain/entities/chronicDiseases/chronicDiseases";

export interface EducationEntry {
  id: number;
  employee_id: number;
  category: string;                  // 'latest' or 'previous'
  degree_name: string;
  graduation_year: string;           // note: string in JSON, but can be number
  academic_stage: string | null;
  study_status: string | null;
  created_at: string;
  updated_at: string;
  university_id: number;
  faculty_id: number;
  specialization_id: number;
  university: University;
  faculty: Faculty;
  specialization: Specialization;
}

export interface EmployeeChildren {
  id: number,
  name: string,
  birthdate: string
}

export interface EmploymentDetails {
  id: number;
  employee_id: number;
  job_title: string;
  org_unit_id: number;
  status: EmploymentStatus;                    // e.g., 'active'
  appointment_date: string;          // YYYY-MM-DD
  contract_type: ContractType;             // 'Full-time', etc.
  contract_nature: ContractNature;           // 'Permanent', etc.
  job_category: string;
  workplace_city_id: number;
  workplace_city?: City;
  created_at: string;
  updated_at: string;
}

export interface EmployeeData {
  id: number;
  internal_id: string;
  national_id: string;
  first_name: string;
  father_name: string;
  grandfather_name: string;
  last_name: string;
  mother_name: string;
  gender: Gender;                    // 'male', 'female'
  date_birth: string;                // YYYY-MM-DD
  place_birth: string;
  assigned_job: string;
  marital_status: MaritalStatus;          // 'married', 'single', etc.   
  number_of_children: number;
  spouse_name: string;
  spouse_workplace: string;
  blood_type: BloodType;                // 'O+', etc.
  phone_number: string;
  sham_cash_account: string;
  residence_region_id: number;
  residence_region?: Region & { city?: City & { country?: Country } };
  residential_area_details: string;
  civil_registry_record: string;
  health_status: string;
  injury_details: string | null;
  injury_date: string | null;
  chronic_diseases: ChronicDiseases[];
  employment_details: EmploymentDetails;

  educations: EducationEntry[];
  created_at: string;
  updated_at: string;
  children:EmployeeChildren[];
  folder:string;
  photo_id:string;

  employee_status_id:number;
  employee_status_note:string;
  job_status_id:number;
  job_status_note:string;
}