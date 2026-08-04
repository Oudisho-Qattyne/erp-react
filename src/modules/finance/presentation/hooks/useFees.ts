import { useState, useCallback, useEffect } from "react"
import { useApiClient } from "../../../../core/presentation/context/api/ApiClinetProvider"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { createFeeRepository } from "../../infrastructure/repositories/FeeRepository"
import { createManageFeesUseCase } from "../../application/usecases/manageFeesUseCase"
import type { CreateFeeDto, FeeFilters, UpdateFeeDto } from "../../application/dtos/feeDtos"
import type { Fee } from "../../domain/entities/Fee"
import { toast } from "sonner"
import { useIdempotency } from "../../../../core/presentation/hooks/useIdempotency"

const MODULE = "finance"

const OP_KEYS = ["findAllFees", "findFeeById", "createFee", "updateFee", "archiveFee", "activeFee"] as const

function initRecord<T>(value: T): Record<string, T> {
  return Object.fromEntries(OP_KEYS.map((k) => [k, value]))
}

export interface UseFeesReturn {
  fees: Fee[]
  fee: Fee | null
  setFee: (fee: Fee | null) => void
  loading: Record<string, boolean>
  isLoading: () => boolean
  error: Record<string, string | null>
  hasErrors: () => boolean
  clearError: () => void
  pagination: { currentPage: number; lastPage: number; total: number; hasMore: boolean }
  filter: FeeFilters
  setFilter: (patch: Partial<FeeFilters>) => void
  resetFilter: () => void
  setPage: (page: number) => void
  findAllFees: () => Promise<void>
  findFeeById: (id: number) => Promise<void>
  createFee: (data: CreateFeeDto) => Promise<void>
  updateFee: (id: number, data: UpdateFeeDto) => Promise<void>
  archiveFee: (fee: Pick<Fee, "id" | "name">) => Promise<void>
  activeFee: (fee: Pick<Fee, "id" | "name">) => Promise<void>
}

export const useFees = (): UseFeesReturn => {
  const apiClient = useApiClient()
  const { t } = useLanguage()

  const [fees, setFees] = useState<Fee[]>([])
  const [fee, setFee] = useState<Fee | null>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>(() => initRecord(false))
  const [error, setError] = useState<Record<string, string | null>>(() => initRecord(null))
  const [filter, setFilterState] = useState<FeeFilters>({})
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, hasMore: false })

  const repository = createFeeRepository(apiClient)
  const useCase = createManageFeesUseCase(repository)
  const idem = useIdempotency()

  const setFnLoading = (fn: string, v: boolean) => setLoading((p) => ({ ...p, [fn]: v }))
  const setFnError = (fn: string, e: string | null) => setError((p) => ({ ...p, [fn]: e }))

  const clearError = useCallback(() => setError(initRecord(null)), [])

  useEffect(() => {
    findAllFees()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const setFilter = useCallback((patch: Partial<FeeFilters>) => {
    setFilterState((prev) => ({ ...prev, ...patch, page: 1 }))
  }, [])

  const resetFilter = useCallback(() => setFilterState({}), [])

  const setPage = useCallback((page: number) => {
    setFilterState((prev) => ({ ...prev, page }))
  }, [])

  const findAllFees = useCallback(async () => {
    setFnLoading("findAllFees", true)
    setFnError("findAllFees", null)
    try {
      const res = await useCase.findAllFees(filter)
      setFees(res.data)
      setPagination({
        currentPage: res.currentPage || 1,
        lastPage: res.lastPage || 1,
        total: Number(res.total) || 0,
        hasMore: res.hasMore || false,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("fee.load_error", MODULE) || "Failed to load fees"
      setFnError("findAllFees", msg)
      toast.error(msg)
    } finally {
      setFnLoading("findAllFees", false)
    }
  }, [useCase, filter, t])

  const findFeeById = useCallback(async (id: number) => {
    setFnLoading("findFeeById", true)
    setFnError("findFeeById", null)
    try {
      const res = await useCase.findFeeById(id)
      setFee(res?.data ?? null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("fee.load_error", MODULE) || "Failed to load fee"
      setFnError("findFeeById", msg)
      toast.error(msg)
      throw err
    } finally {
      setFnLoading("findFeeById", false)
    }
  }, [useCase, t])

  const createFee = useCallback(async (data: CreateFeeDto) => {
    setFnLoading("createFee", true)
    setFnError("createFee", null)
    try {
      await idem.run("createFee", data, (key) => useCase.createFee(data, key))
      toast.success(t("fee.created", MODULE) || "Fee created successfully")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("fee.create_error", MODULE) || "Failed to create fee"
      setFnError("createFee", msg)
      toast.error(msg)
      throw err
    } finally {
      setFnLoading("createFee", false)
    }
  }, [useCase, t, idem])

  const updateFee = useCallback(async (id: number, data: UpdateFeeDto) => {
    setFnLoading("updateFee", true)
    setFnError("updateFee", null)
    try {
      const res = await idem.run("updateFee", { id, data }, (key) => useCase.updateFee(id, data, key))
      setFee(res.data)
      toast.success(t("fee.updated", MODULE) || "Fee updated successfully")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("fee.update_error", MODULE) || "Failed to update fee"
      setFnError("updateFee", msg)
      toast.error(msg)
      throw err
    } finally {
      setFnLoading("updateFee", false)
    }
  }, [useCase, t, idem])

  const archiveFee = useCallback(async (fee: Pick<Fee, "id" | "name">) => {
    setFnLoading("archiveFee", true)
    setFnError("archiveFee", null)
    try {
      const res = await idem.run("archiveFee", fee, (key) => useCase.archiveFee(fee, key))
      setFee(res.data)
      toast.success(t("fee.archived", MODULE) || "Fee archived successfully")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("fee.archive_error", MODULE) || "Failed to archive fee"
      setFnError("archiveFee", msg)
      toast.error(msg)
      throw err
    } finally {
      setFnLoading("archiveFee", false)
    }
  }, [useCase, t, idem])

  const activeFee = useCallback(async (fee: Pick<Fee, "id" | "name">) => {
    setFnLoading("activeFee", true)
    setFnError("activeFee", null)
    try {
      const res = await idem.run("activeFee", fee, (key) => useCase.activeFee(fee, key))
      setFee(res.data)
      toast.success(t("fee.activated", MODULE) || "Fee activated successfully")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("fee.activate_error", MODULE) || "Failed to activate fee"
      setFnError("activeFee", msg)
      toast.error(msg)
      throw err
    } finally {
      setFnLoading("activeFee", false)
    }
  }, [useCase, t, idem])

  const isLoading = useCallback(() => Object.values(loading).some(Boolean), [loading])
  const hasErrors = useCallback(() => Object.values(error).some((e) => e !== null), [error])

  return {
    fees,
    fee,
    setFee,
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
    findAllFees,
    findFeeById,
    createFee,
    updateFee,
    archiveFee,
    activeFee,
  }
}
