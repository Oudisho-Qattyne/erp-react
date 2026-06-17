import type { SortType } from "../../../../../core/domain/valueObjects/common/SortType";
import type { AccrualPeriod } from "../../../domain/valueObjects/leave/AccrualPeriod";
import type { BalanceMode } from "../../../domain/valueObjects/leave/BalanceMode";
import type { LeaveUnit } from "../../../domain/valueObjects/leave/LeaveUnit";

export interface FilterLeaveDto {
    page: number;
    per_page: number;
    search?: string;
    unit?: LeaveUnit;
    balance_mode?:BalanceMode;
    accrual_period?:AccrualPeriod;
    is_paid?:boolean;
    is_active?:boolean;
    requires_approval?:boolean;
    allow_half_day?:boolean;
    allow_hourly?:boolean;
    allow_split?:boolean;
    "sort_by[name]"?:SortType;
    "sort_by[created_at]"?:SortType;
}