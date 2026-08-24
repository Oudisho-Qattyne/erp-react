import type { ComponentType } from "react"
import type { DomainResponse } from "../../domain/common/responce/DomainResponse"
import type { User } from "../../../modules/users/domain/entities/user/user"

export interface UserApi {
  getCurrentUser?: () => Promise<DomainResponse<User>>
}

let userApi: UserApi | null = null

export const registerUserApi = (api: UserApi): void => {
  userApi = api
}

export const getUserApi = (): UserApi | null => {
  return userApi
}

export interface UserPickerDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selected: User[]) => void
  multiple?: boolean
  initialSelected?: User[]
  defaultFilter?: Record<string, any>
}

let userPickerDialog: ComponentType<UserPickerDialogProps> | null = null

export const registerUserPickerDialog = (component: ComponentType<UserPickerDialogProps>): void => {
  userPickerDialog = component
}

export const getUserPickerDialog = (): ComponentType<UserPickerDialogProps> | null => {
  return userPickerDialog
}
