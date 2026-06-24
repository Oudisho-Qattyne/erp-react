import type { SortType } from "../../../../../core/domain/valueObjects/common/SortType";

export interface FilterEmployeeDto {
    page: number;
    per_page: number;
    search?: string;
    gender?: string;
    marital_status?: string;
    blood_type?: string;
    date_birth?: string;
    has_sham_cash_account?: boolean;
    residence_region_id?: number;
    university_id?: number;
    faculty_id?: number;
    specialization_id?: number;
    organizational_unit?: number;
    work_place_city?: number;
    "sort_by[first_name]"?: SortType;
    "sort_by[last_name]"?: SortType;
    "sort_by[created_at]"?: SortType;
}