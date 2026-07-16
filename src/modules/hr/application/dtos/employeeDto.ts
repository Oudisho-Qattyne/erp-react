// src/modules/hr/application/dtos/employee.dto.ts

import type { BloodType } from '../../../../core/domain/valueObjects/BloodType';
import type { Gender } from '../../../../core/domain/valueObjects/Gender';
import type { MaritalStatus } from '../../../../core/domain/valueObjects/MaritalStatus';
import type { EducationEntry, EmployeeChildren, EmployeeSpouse, EmploymentDetails } from '../../domain/entities/employee';
  
  // -----------------------------------------------------------------------------
  // Education DTOs
  // -----------------------------------------------------------------------------
  // Omit auto‑generated fields and nested full entities
  export type CreateEducationDTO = Omit<
    EducationEntry,
    | 'id'
    | 'employee_id'
    | 'created_at'
    | 'updated_at'
    | 'university'
    | 'faculty'
    | 'specialization'
  >;
  export type CreateEmployeeChildrenDTO = Omit<EmployeeChildren,
  | 'id'>;
  
  export type UpdateEmployeeChildrenDTO = Partial<CreateEmployeeChildrenDTO>;
  export type UpdateEducationDTO = Partial<CreateEducationDTO>;
  
  // -----------------------------------------------------------------------------
  // Employment details DTOs
  // -----------------------------------------------------------------------------
  export type CreateEmploymentDetailsDTO = Omit<
    EmploymentDetails,
    'id' | 'employee_id' | 'created_at' | 'updated_at'
  >;
  
  export type UpdateEmploymentDetailsDTO = Partial<CreateEmploymentDetailsDTO>;
  
  // -----------------------------------------------------------------------------
  // Employee DTOs
  // -----------------------------------------------------------------------------
  export interface CreateEmployeeDTO {
    personal_id_number: string;
    national_id: string;
    first_name: string;
    father_name: string;
    grandfather_name: string;
    last_name: string;
    mother_name: string;
    gender: Gender;
    date_birth: string;
    place_birth: string;
    assigned_job:string;
    marital_status: MaritalStatus;
    number_of_children: number;
    wives: EmployeeSpouse[];
    spouse_workplace: string;
    blood_type: BloodType;
    phone_number: string;
    sham_cash_account: string;
    residence_region: string;
    residential_area_details: string;
    civil_registry_record: string;
    health_status: string;
    injury_details: string | null;
    injury_date: string | null;
    employment_details: CreateEmploymentDetailsDTO;
    educations: CreateEducationDTO[];
    childre:CreateEmployeeChildrenDTO[];
    photo_id?:string
  }
  
  export type UpdateEmployeeDTO = Partial<CreateEmployeeDTO>;