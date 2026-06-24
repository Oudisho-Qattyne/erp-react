export interface CreateLeaveRequestDto{
  leave_type_id: number,
  start_date: string,
  end_date: string,
  requested_units: number,
  reason: string
}