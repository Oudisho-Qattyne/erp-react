export interface EmployeePickerProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selected: any[]) => void
  multiple?: boolean
  initialSelected?: any[]
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
