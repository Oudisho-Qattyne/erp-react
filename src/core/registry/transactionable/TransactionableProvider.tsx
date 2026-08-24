import React, { createContext, useContext, type ReactNode } from 'react'
import { getTransactionableApi, type TransactionableApi } from './transactionableRegistry'

const TransactionableContext = createContext<TransactionableApi | null>(null)

export const TransactionableProvider = ({ children }: { children: ReactNode }) => {
  const api = getTransactionableApi()
  return (
    <TransactionableContext.Provider value={api}>
      {children}
    </TransactionableContext.Provider>
  )
}

export const useTransactionableDetails = () => {
  const context = useContext(TransactionableContext)
  if (!context) throw new Error('useTransactionableDetails must be used within a TransactionableProvider')
  return context
}
