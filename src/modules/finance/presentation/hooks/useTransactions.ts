import { useState, useCallback, useEffect } from "react"
import { useApiClient } from "../../../../core/presentation/context/api/ApiClinetProvider"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { createTransactionRepository } from "../../infrastructure/repositories/TransactionRepository"
import { createManageTransactionsUseCase } from "../../application/usecases/manageTransactionsUseCase"
import type { CreateTransactionDto, TransactionFilters, UpdateTransactionStatusDto } from "../../application/dtos/transactionDtos"
import type { Transaction } from "../../domain/entities/Transaction"
import { toast } from "sonner"
import { useIdempotency } from "../../../../core/presentation/hooks/useIdempotency"

const MODULE = "finance"

const OP_KEYS = ["findAllTransactions", "createTransaction", "updateTransactionStatus"] as const

function initRecord<T>(value: T): Record<string, T> {
  return Object.fromEntries(OP_KEYS.map((k) => [k, value]))
}

export interface UseTransactionsReturn {
  transactions: Transaction[]
  transaction: Transaction | null
  setTransaction: (transaction: Transaction | null) => void
  loading: Record<string, boolean>
  isLoading: () => boolean
  error: Record<string, string | null>
  hasErrors: () => boolean
  clearError: () => void
  pagination: { currentPage: number; lastPage: number; total: number; hasMore: boolean }
  filter: TransactionFilters
  setFilter: (patch: Partial<TransactionFilters>) => void
  resetFilter: () => void
  setPage: (page: number) => void
  findAllTransactions: () => Promise<void>
  createTransaction: (data: CreateTransactionDto) => Promise<void>
  updateTransactionStatus: (id: number, data: UpdateTransactionStatusDto) => Promise<void>
}

export const useTransactions = (): UseTransactionsReturn => {
  const apiClient = useApiClient()
  const { t } = useLanguage()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>(() => initRecord(false))
  const [error, setError] = useState<Record<string, string | null>>(() => initRecord(null))
  const [filter, setFilterState] = useState<TransactionFilters>({})
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, hasMore: false })

  const repository = createTransactionRepository(apiClient)
  const useCase = createManageTransactionsUseCase(repository)
  const idem = useIdempotency()

  const setFnLoading = (fn: string, v: boolean) => setLoading((p) => ({ ...p, [fn]: v }))
  const setFnError = (fn: string, e: string | null) => setError((p) => ({ ...p, [fn]: e }))

  const clearError = useCallback(() => setError(initRecord(null)), [])

  useEffect(() => {
    findAllTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const setFilter = useCallback((patch: Partial<TransactionFilters>) => {
    setFilterState((prev) => ({ ...prev, ...patch, page: 1 }))
  }, [])

  const resetFilter = useCallback(() => setFilterState({}), [])

  const setPage = useCallback((page: number) => {
    setFilterState((prev) => ({ ...prev, page }))
  }, [])

  const findAllTransactions = useCallback(async () => {
    setFnLoading("findAllTransactions", true)
    setFnError("findAllTransactions", null)
    try {
      const res = await useCase.findAllTransactions(filter)
      setTransactions(res.data)
      setPagination({
        currentPage: res.pagination?.currentPage || 1,
        lastPage: res.pagination?.lastPage || 1,
        total: Number(res.pagination?.total) || 0,
        hasMore: res.pagination?.hasMore || false,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("transaction.load_error", MODULE) || "Failed to load transactions"
      setFnError("findAllTransactions", msg)
      toast.error(msg)
    } finally {
      setFnLoading("findAllTransactions", false)
    }
  }, [useCase, filter, t])

  const createTransaction = useCallback(async (data: CreateTransactionDto) => {
    setFnLoading("createTransaction", true)
    setFnError("createTransaction", null)
    try {
      const res = await idem.run("createTransaction", data, (key) => useCase.createTransaction(data, key))
      setTransaction(res.data)
      toast.success(t("transaction.created", MODULE) || "Transaction created successfully")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("transaction.create_error", MODULE) || "Failed to create transaction"
      setFnError("createTransaction", msg)
      toast.error(msg)
      throw err
    } finally {
      setFnLoading("createTransaction", false)
    }
  }, [useCase, t, idem])

  const updateTransactionStatus = useCallback(async (id: number, data: UpdateTransactionStatusDto) => {
    setFnLoading("updateTransactionStatus", true)
    setFnError("updateTransactionStatus", null)
    try {
      const res = await idem.run("updateTransactionStatus", { id, data }, (key) => useCase.updateTransactionStatus(id, data, key))
      setTransaction(res.data)
      toast.success(t("transaction.updated", MODULE) || "Transaction updated successfully")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("transaction.update_error", MODULE) || "Failed to update transaction"
      setFnError("updateTransactionStatus", msg)
      toast.error(msg)
      throw err
    } finally {
      setFnLoading("updateTransactionStatus", false)
    }
  }, [useCase, t, idem])

  const isLoading = useCallback(() => Object.values(loading).some(Boolean), [loading])
  const hasErrors = useCallback(() => Object.values(error).some((e) => e !== null), [error])

  return {
    transactions,
    transaction,
    setTransaction,
    loading,
    isLoading,
    error,
    hasErrors,
    clearError,
    pagination,
    filter,
    setFilter,
    resetFilter,
    setPage,
    findAllTransactions,
    createTransaction,
    updateTransactionStatus,
  }
}
