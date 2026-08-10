import React, { createContext, useContext, type ReactNode } from 'react'
import { getPersonApi, type PersonApi } from './personRegistry'

const PersonContext = createContext<PersonApi | null>(null)

export const PersonProvider = ({ children }: { children: ReactNode }) => {
  const api = getPersonApi()
  return (
    <PersonContext.Provider value={api}>
      {children}
    </PersonContext.Provider>
  )
}

export const usePersonDetails = () => {
  const context = useContext(PersonContext)
  if (!context) throw new Error('usePersonDetails must be used within a PersonProvider')
  return context
}