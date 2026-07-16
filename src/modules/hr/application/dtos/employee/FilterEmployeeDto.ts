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
    residence_region?: string;
    university_id?: number;
    faculty_id?: number;
    specialization_id?: number;
    organizational_unit?: number;
    work_place_city?: number;
    linked_to_user?: boolean;
    "sort_by[first_name]"?: SortType;
    "sort_by[last_name]"?: SortType;
    "sort_by[created_at]"?: SortType;
}