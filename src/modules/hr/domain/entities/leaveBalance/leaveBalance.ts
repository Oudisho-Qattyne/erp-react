export interface LeaveBalance {
    employee_id: number;
    leave_type_id: number;
    leave_type_name: string;
    accrual_period: "month" | "year";
    entitled_units: number;
    consumed_units: number;
    system_correction_added_units: number;
    system_correction_detected_units: number;
    adjustment_added_units: number;
    adjustment_detected_units: number;
    carried_forward_units: number;
    available_units: number;
}