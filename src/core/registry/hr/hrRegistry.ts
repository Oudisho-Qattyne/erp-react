import type { EmployeeListItem } from "../../../modules/hr/domain/entities/EmployeeListItem"

export interface EmployeePickerProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selected: EmployeeListItem[]) => void
  multiple?: boolean
  initialSelected?: EmployeeListItem[]
  defaultFilter?: Record<string, any>
}

export interface HrApi {
  EmployeePickerComponent?: React.ComponentType<EmployeePickerProps>
}

let hrApi: HrApi | null = null

export const registerHrApi = (api: HrApi): void => {
  hrApi = api
}

export const getHrApi = (): HrApi | null => {
  return hrApi
}
