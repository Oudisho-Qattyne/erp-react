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
