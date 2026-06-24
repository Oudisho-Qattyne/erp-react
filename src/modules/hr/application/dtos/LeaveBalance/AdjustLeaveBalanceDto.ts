export interface AdjustLeaveBalanceDto {
    leave_type_id: number;
    employee_ids: number[];
    adjustment_type: "add" | "deduct"; // or string if more values are possible
    quantity: number;
    notes?: string;
}