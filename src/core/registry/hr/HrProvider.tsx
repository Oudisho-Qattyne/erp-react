import React, { createContext, useContext, type ReactNode } from 'react'
import { getHrApi, type HrApi } from './hrRegistry'

const HrContext = createContext<HrApi | null>(null)

export const HrProvider = ({ children }: { children: ReactNode }) => {
  const api = getHrApi()
  return (
    <HrContext.Provider value={api}>
      {children}
    </HrContext.Provider>
  )
}

export const useHr = () => {
  return useContext(HrContext)
}
