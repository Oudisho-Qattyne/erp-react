import React, { createContext, useContext, type ReactNode } from 'react'
import { getUserApi, type UserApi } from './userRegistry'

const UserContext = createContext<UserApi | null>(null)

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const api = getUserApi()
  return (
    <UserContext.Provider value={api}>
      {children}
    </UserContext.Provider>
  )
}

export const useUserApi = () => {
  return useContext(UserContext)
}
