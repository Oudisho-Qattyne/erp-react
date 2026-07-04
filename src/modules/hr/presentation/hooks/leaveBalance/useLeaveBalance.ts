import { useState, useCallback, useEffect } from "react"
import { useApiClient } from "../../../../../core/presentation/context/api/ApiClinetProvider"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { createLeaveBalanceRepository } from "../../../infrastructure/leaveBalance/repository"
import { createManageLeaveBalanceUseCase } from "../../../application/usecases/leaveBalance/manageLeaveBalanceUseCase"
import type { LeaveBalance } from "../../../domain/entities/leaveBalance/leaveBalance"
import type { FilterLeaveBalancesDto } from "../../../application/dtos/LeaveBalance/FilterLeaveBalanceDto"
import type { AdjustLeaveBalanceDto } from "../../../application/dtos/LeaveBalance/AdjustLeaveBalanceDto"
import { toast } from "sonner"

const OP_KEYS = ["findAllMyLeaveBalances", "findAllEmployeeLeaveBalances", "adjustLeaveBalance"] as const

function initRecord<T>(value: T): Record<string, T> {
  return Object.fromEntries(OP_KEYS.map((k) => [k, value]))
}

const DEFAULT_FILTER: FilterLeaveBalancesDto = {
  page: 1,
  per_page: 25,
}

export interface UseLeaveBalanceReturn {
  myLeaveBalances: LeaveBalance[]
  employeeLeaveBalances: LeaveBalance[]
  loading: Record<string, boolean>
  isLoading: () => boolean
  error: Record<string, string | null>
  hasErrors: () => boolean
  pagination: { currentPage: number; lastPage: number; total: number; hasMore: boolean }
  filter: FilterLeaveBalancesDto
  setFilter: (patch: Partial<FilterLeaveBalancesDto> | ((prev: FilterLeaveBalancesDto) => FilterLeaveBalancesDto)) => void
  resetFilter: () => void
  clearError: () => void
  findAllMyLeaveBalances: () => Promise<void>
  findAllEmployeeLeaveBalances: (employeeId?: number) => Promise<void>
  adjustLeaveBalance: (adjust: AdjustLeaveBalanceDto) => Promise<void>
  setSearch: (search: string) => void
  setPage: (page: number) => void
}

export const useLeaveBalance = (): UseLeaveBalanceReturn => {
  const apiClient = useApiClient()
  const { language, t } = useLanguage()

  const [myLeaveBalances, setMyLeaveBalances] = useState<LeaveBalance[]>([])
  const [employeeLeaveBalances, setEmployeeLeaveBalances] = useState<LeaveBalance[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>(() => initRecord(false))
  const [error, setError] = useState<Record<string, string | null>>(() => initRecord(null))
  const [filter, setFilterState] = useState<FilterLeaveBalancesDto>(DEFAULT_FILTER)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, hasMore: false })

  const repository = createLeaveBalanceRepository(apiClient)
  const useCase = createManageLeaveBalanceUseCase(repository)

  const setFnLoading = (fn: string, v: boolean) => setLoading((p) => ({ ...p, [fn]: v }))
  const setFnError = (fn: string, e: string | null) => setError((p) => ({ ...p, [fn]: e }))

  const clearError = useCallback(() => setError(initRecord(null)), [])

  const setFilter = useCallback((patch: Partial<FilterLeaveBalancesDto> | ((prev: FilterLeaveBalancesDto) => FilterLeaveBalancesDto)) => {
    setFilterState((prev) => typeof patch === "function" ? patch(prev) : { ...prev, ...patch })
  }, [])

  const resetFilter = useCallback(() => setFilterState(DEFAULT_FILTER), [])

  const setSearch = useCallback((search: string) => {
    setFilterState((prev) => {
      const next = { ...prev, page: 1 }
      if (search.trim()) {
        next.search = search
      } else {
        delete next.search
      }
      return next
    })
  }, [])

  const setPage = useCallback((page: number) => {
    setFilterState((prev) => ({ ...prev, page }))
  }, [])

  const findAllMyLeaveBalances = useCallback(async () => {
    setFnLoading("findAllMyLeaveBalances", true)
    setFnError("findAllMyLeaveBalances", null)
    try {
      const res = await useCase.findAllMyLeaveBalances(filter)
      setMyLeaveBalances(res.data)
      setPagination({
        currentPage: res.currentPage || 1,
        lastPage: res.lastPage || 1,
        total: (res.total as any) || 0,
        hasMore: res.hasMore || false,
      })
    } catch (err: any) {
      const msg = err.message || "Failed to fetch my leave balances"
      setFnError("findAllMyLeaveBalances", msg)
      toast.error(t("leave_balance.load_error", "hr").replace("{message}", msg))
    } finally {
      setFnLoading("findAllMyLeaveBalances", false)
    }
  }, [useCase, filter, t])

  const findAllEmployeeLeaveBalances = useCallback(async (employeeId?: number) => {
    setFnLoading("findAllEmployeeLeaveBalances", true)
    setFnError("findAllEmployeeLeaveBalances", null)
    try {
      const res = await useCase.findAllEmployeeLeaveBalances(employeeId, filter)
      setEmployeeLeaveBalances(res.data)
      setPagination({
        currentPage: res.currentPage || 1,
        lastPage: res.lastPage || 1,
        total: (res.total as any) || 0,
        hasMore: res.hasMore || false,
      })
    } catch (err: any) {
      const msg = err.message || "Failed to fetch employee leave balances"
      setFnError("findAllEmployeeLeaveBalances", msg)
      toast.error(t("leave_balance.employee_load_error", "hr").replace("{message}", msg))
    } finally {
      setFnLoading("findAllEmployeeLeaveBalances", false)
    }
  }, [useCase, filter, t])

  const adjustLeaveBalance = useCallback(async (adjust: AdjustLeaveBalanceDto) => {
    setFnLoading("adjustLeaveBalance", true)
    setFnError("adjustLeaveBalance", null)
    try {
      await useCase.adjustLeaveBalance(adjust)
      toast.success(t("leave_balance.adjusted", "hr"))
    } catch (err: any) {
      const msg = err.message || "Failed to adjust leave balance"
      setFnError("adjustLeaveBalance", msg)
      toast.error(t("leave_balance.adjust_error", "hr").replace("{message}", msg))
      throw err
    } finally {
      setFnLoading("adjustLeaveBalance", false)
    }
  }, [useCase, t])

  const isLoading = useCallback(() => Object.values(loading).some(Boolean), [loading])
  const hasErrors = useCallback(() => Object.values(error).some((e) => e !== null), [error])


  return {
    myLeaveBalances,
    employeeLeaveBalances,
    loading,
    isLoading,
    error,
    hasErrors,
    pagination,
    filter,
    setFilter,
    resetFilter,
    clearError,
    findAllMyLeaveBalances,
    findAllEmployeeLeaveBalances,
    adjustLeaveBalance,
    setSearch,
    setPage,
  }
}
