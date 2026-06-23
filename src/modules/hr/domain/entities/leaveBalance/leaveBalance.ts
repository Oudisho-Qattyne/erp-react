export interface LeaveBalance {
    employee_id: number,
    leave_type_id: number,
    leave_type_name: string,
    accrual_period: "yearly" | "month",
    entitled_units: number,
    consumed_units: number,
    system_correction_added_units: number,
    system_correction_deducted_units: number,
    adjustment_added_units: number,
    adjustment_deducted_units: number,
    carried_forward_units: number,
    available_units: number
  }