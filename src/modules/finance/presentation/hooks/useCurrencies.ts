import { useState, useCallback, useEffect } from "react"
import { useApiClient } from "../../../../core/presentation/context/api/ApiClinetProvider"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { createCurrencyRepository } from "../../infrastructure/repositories/CurrencyRepository"
import { createManageCurrenciesUseCase } from "../../application/usecases/manageCurrenciesUseCase"
import { handleApiError } from "../../../../core/presentation/utils/handleApiError"
import type { CreateCurrencyDto, CurrencyFilters, UpdateCurrencyDto } from "../../application/dtos/currencyDtos"
import type { Currency } from "../../domain/entities/Currency"
import { toast } from "sonner"
import { useIdempotency } from "../../../../core/presentation/hooks/useIdempotency"

const MODULE = "finance"

const OP_KEYS = ["findAllCurrencies", "createCurrency", "updateCurrency", "deleteCurrency"] as const

function initRecord<T>(value: T): Record<string, T> {
  return Object.fromEntries(OP_KEYS.map((k) => [k, value]))
}

export interface UseCurrenciesReturn {
  currencies: Currency[]
  currency: Currency | null
  setCurrency: (currency: Currency | null) => void
  loading: Record<string, boolean>
  isLoading: () => boolean
  error: Record<string, string | null>
  hasErrors: () => boolean
  clearError: () => void
  pagination: { currentPage: number; lastPage: number; total: number; hasMore: boolean }
  filter: CurrencyFilters
  setFilter: (patch: Partial<CurrencyFilters>) => void
  resetFilter: () => void
  setPage: (page: number) => void
  findAllCurrencies: () => Promise<void>
  createCurrency: (data: CreateCurrencyDto) => Promise<void>
  updateCurrency: (code: string, data: UpdateCurrencyDto) => Promise<void>
  deleteCurrency: (currency: Pick<Currency, "code">) => Promise<void>
}

export const useCurrencies = (): UseCurrenciesReturn => {
  const apiClient = useApiClient()
  const { t } = useLanguage()

  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [currency, setCurrency] = useState<Currency | null>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>(() => initRecord(false))
  const [error, setError] = useState<Record<string, string | null>>(() => initRecord(null))
  const [filter, setFilterState] = useState<CurrencyFilters>({})
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, hasMore: false })

  const repository = createCurrencyRepository(apiClient)
  const useCase = createManageCurrenciesUseCase(repository)
  const idem = useIdempotency()

  const setFnLoading = (fn: string, v: boolean) => setLoading((p) => ({ ...p, [fn]: v }))
  const setFnError = (fn: string, e: string | null) => setError((p) => ({ ...p, [fn]: e }))

  const clearError = useCallback(() => setError(initRecord(null)), [])


  const setFilter = useCallback((patch: Partial<CurrencyFilters>) => {
    setFilterState((prev) => ({ ...prev, ...patch, page: 1 }))
  }, [])

  const resetFilter = useCallback(() => setFilterState({}), [])

  const setPage = useCallback((page: number) => {
    setFilterState((prev) => ({ ...prev, page }))
  }, [])

  const findAllCurrencies = useCallback(async () => {
    setFnLoading("findAllCurrencies", true)
    setFnError("findAllCurrencies", null)
    try {
      const res = await useCase.findAllCurrencies(filter)
      setCurrencies(res.data)
      setPagination({
        currentPage: res.pagination?.currentPage || 1,
        lastPage: res.pagination?.lastPage || 1,
        total: Number(res.pagination?.total) || 0,
        hasMore: res.pagination?.hasMore || false,
      })
    } catch (err: unknown) {
      setFnError("findAllCurrencies", handleApiError(err, { module: MODULE }))
    } finally {
      setFnLoading("findAllCurrencies", false)
    }
  }, [useCase, filter, t])

  const createCurrency = useCallback(async (data: CreateCurrencyDto) => {
    setFnLoading("createCurrency", true)
    setFnError("createCurrency", null)
    try {
      await idem.run("createCurrency", data, (key) => useCase.createCurrency(data, key))
      toast.success(t("currency.created", MODULE) || "Currency created successfully")
    } catch (err: unknown) {
      setFnError("createCurrency", handleApiError(err, { module: MODULE }))
      throw err
    } finally {
      setFnLoading("createCurrency", false)
    }
  }, [useCase, t, idem])

  const updateCurrency = useCallback(async (code: string, data: UpdateCurrencyDto) => {
    setFnLoading("updateCurrency", true)
    setFnError("updateCurrency", null)
    try {
      const res = await idem.run("updateCurrency", { code, data }, (key) => useCase.updateCurrency(code, data, key))
      setCurrency(res.data)
      toast.success(t("currency.updated", MODULE) || "Currency updated successfully")
    } catch (err: unknown) {
      setFnError("updateCurrency", handleApiError(err, { module: MODULE }))
      throw err
    } finally {
      setFnLoading("updateCurrency", false)
    }
  }, [useCase, t, idem])

  const deleteCurrency = useCallback(async (target: Pick<Currency, "code">) => {
    setFnLoading("deleteCurrency", true)
    setFnError("deleteCurrency", null)
    try {
      await idem.run("deleteCurrency", target, (key) => useCase.deleteCurrency(target, key))
      toast.success(t("currency.deleted", MODULE) || "Currency deleted successfully")
    } catch (err: unknown) {
      setFnError("deleteCurrency", handleApiError(err, { module: MODULE }))
      throw err
    } finally {
      setFnLoading("deleteCurrency", false)
    }
  }, [useCase, t, idem])

  const isLoading = useCallback(() => Object.values(loading).some(Boolean), [loading])
  const hasErrors = useCallback(() => Object.values(error).some((e) => e !== null), [error])

  return {
    currencies,
    currency,
    setCurrency,
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
    findAllCurrencies,
    createCurrency,
    updateCurrency,
    deleteCurrency,
  }
}
