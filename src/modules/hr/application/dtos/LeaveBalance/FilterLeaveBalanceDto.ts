import type { SortType } from "../../../../../core/domain/valueObjects/common/SortType";

export interface FilterLeaveBalancesDto {
    page: number;
    per_page: number;
    search?: string;
    employee_id?: number;
    leave_type_id?: number;
    "sort_by[entitled_units]"?: SortType;
    "sort_by[consumed_units]"?: SortType;
    "sort_by[system_correction_added_units]"?: SortType;
    "sort_by[system_correction_deducted_units]"?: SortType;
    "sort_by[adjustment_added_units]"?: SortType;
    "sort_by[adjustment_deducted_units]"?: SortType;
    "sort_by[carried_forward_units]"?: SortType;
    "sort_by[available_units]"?: SortType;
    "sort_by[leave_type_name]"?: SortType;
}