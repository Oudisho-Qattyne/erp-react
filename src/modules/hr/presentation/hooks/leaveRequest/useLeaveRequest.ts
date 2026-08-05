import { useState, useCallback, useEffect } from "react"
import { useApiClient } from "../../../../../core/presentation/context/api/ApiClinetProvider"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { createLeaveRequesteRepository } from "../../../infrastructure/leaveRequest/repository"
import { createManageLeaveRequestUseCase } from "../../../application/usecases/leaveRequest/manageLeaveRequestUseCase"
import { handleApiError } from "../../../../../core/presentation/utils/handleApiError"
import type { LeaveRequest } from "../../../domain/entities/leaveRequest/leaveRequest"
import type { FilterLeaveRequestDto } from "../../../application/dtos/leaveRequest/FilterLeaveRequestDto"
import type { CreateLeaveRequestDto, UpdateLeaveRequestDto } from "../../../application/dtos/leaveRequest/leaveRequest"
import type { LeaveRequestProcessOperations } from "../../../domain/valueObjects/leaveRequest/leaveRequestProcessOperations"
import { toast } from "sonner"
import { useIdempotency } from "../../../../../core/presentation/hooks/useIdempotency"

const OP_KEYS = ["findAllMyLeaveRequests", "findAllEmployeeLeaveRequests", "findLeaveRequestById", "createLeaveRequest", "updateLeaveRequest", "processLeaveRequest"] as const

function initRecord<T>(value: T): Record<string, T> {
  return Object.fromEntries(OP_KEYS.map((k) => [k, value]))
}

const DEFAULT_FILTER: FilterLeaveRequestDto = {
  page: 1,
  per_page: 25,
}

export interface UseLeaveRequestReturn {
  myLeaveRequests: LeaveRequest[]
  employeeLeaveRequests: LeaveRequest[]
  currentLeaveRequest: LeaveRequest | null
  loading: Record<string, boolean>
  isLoading: () => boolean
  error: Record<string, string | null>
  hasErrors: () => boolean
  pagination: { currentPage: number; lastPage: number; total: number; hasMore: boolean }
  filter: FilterLeaveRequestDto
  setFilter: (patch: Partial<FilterLeaveRequestDto> | ((prev: FilterLeaveRequestDto) => FilterLeaveRequestDto)) => void
  resetFilter: () => void
  clearError: () => void
  findAllMyLeaveRequests: () => Promise<void>
  findAllEmployeeLeaveRequests: (employeeId?: number) => Promise<void>
  findLeaveRequestById: (id: number) => Promise<void>
  createLeaveRequest: (data: CreateLeaveRequestDto) => Promise<void>
  updateLeaveRequest: (id: number, data: UpdateLeaveRequestDto) => Promise<void>
  processLeaveRequest: (id: number, operation: LeaveRequestProcessOperations, reviewNotes: string) => Promise<void>
  setSearch: (search: string) => void
  setPage: (page: number) => void
}

export const useLeaveRequest = (): UseLeaveRequestReturn => {
  const apiClient = useApiClient()
  const { t } = useLanguage()

  const [myLeaveRequests, setMyLeaveRequests] = useState<LeaveRequest[]>([])
  const [employeeLeaveRequests, setEmployeeLeaveRequests] = useState<LeaveRequest[]>([])
  const [currentLeaveRequest, setCurrentLeaveRequest] = useState<LeaveRequest | null>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>(() => initRecord(false))
  const [error, setError] = useState<Record<string, string | null>>(() => initRecord(null))
  const [filter, setFilterState] = useState<FilterLeaveRequestDto>(DEFAULT_FILTER)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, hasMore: false })

  const repository = createLeaveRequesteRepository(apiClient)
  const useCase = createManageLeaveRequestUseCase(repository)
  const idem = useIdempotency()

  const setFnLoading = (fn: string, v: boolean) => setLoading((p) => ({ ...p, [fn]: v }))
  const setFnError = (fn: string, e: string | null) => setError((p) => ({ ...p, [fn]: e }))

  const clearError = useCallback(() => setError(initRecord(null)), [])

  const setFilter = useCallback((patch: Partial<FilterLeaveRequestDto> | ((prev: FilterLeaveRequestDto) => FilterLeaveRequestDto)) => {
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

  const findAllMyLeaveRequests = useCallback(async () => {
    setFnLoading("findAllMyLeaveRequests", true)
    setFnError("findAllMyLeaveRequests", null)
    try {
      const res = await useCase.findAllMyLeaveRequests(filter)
      setMyLeaveRequests(res.data)
      setPagination({
        currentPage: res.currentPage || 1,
        lastPage: res.lastPage || 1,
        total: (res.total as any) || 0,
        hasMore: res.hasMore || false,
      })
    } catch (err: any) {
      setFnError("findAllMyLeaveRequests", handleApiError(err, { module: "hr" }))
    } finally {
      setFnLoading("findAllMyLeaveRequests", false)
    }
  }, [useCase, filter])

  const findAllEmployeeLeaveRequests = useCallback(async (employeeId?: number) => {
    setFnLoading("findAllEmployeeLeaveRequests", true)
    setFnError("findAllEmployeeLeaveRequests", null)
    try {
      const res = await useCase.findAllEmployeeLeaveRequests({ ...filter, ...(employeeId !== undefined ? { employee_id: employeeId } : {}) })
      setEmployeeLeaveRequests(res.data)
      setPagination({
        currentPage: res.currentPage || 1,
        lastPage: res.lastPage || 1,
        total: (res.total as any) || 0,
        hasMore: res.hasMore || false,
      })
    } catch (err: any) {
      setFnError("findAllEmployeeLeaveRequests", handleApiError(err, { module: "hr" }))
    } finally {
      setFnLoading("findAllEmployeeLeaveRequests", false)
    }
  }, [useCase, filter])

  const findLeaveRequestById = useCallback(async (id: number) => {
    setFnLoading("findLeaveRequestById", true)
    setFnError("findLeaveRequestById", null)
    try {
      const res = await useCase.findLeaveRequestById(id)
      setCurrentLeaveRequest(res.data)
    } catch (err: any) {
      setFnError("findLeaveRequestById", handleApiError(err, { module: "hr" }))
    } finally {
      setFnLoading("findLeaveRequestById", false)
    }
  }, [useCase])

  const createLeaveRequest = useCallback(async (data: CreateLeaveRequestDto) => {
    setFnLoading("createLeaveRequest", true)
    setFnError("createLeaveRequest", null)
    try {
      await idem.run('create', data, (key) => useCase.createLeaveRequset(data, key))
      toast.success(t("leave_request.create_success", "hr"))
    } catch (err: any) {
      setFnError("createLeaveRequest", handleApiError(err, { module: "hr" }))
      throw err
    } finally {
      setFnLoading("createLeaveRequest", false)
    }
  }, [useCase, t, idem])

  const updateLeaveRequest = useCallback(async (id: number, data: UpdateLeaveRequestDto) => {
    setFnLoading("updateLeaveRequest", true)
    setFnError("updateLeaveRequest", null)
    try {
      await idem.run('update', { id, data }, (key) => useCase.updateLeaveRequest(id, data, key))
      toast.success(t("leave_request.update_success", "hr"))
    } catch (err: any) {
      setFnError("updateLeaveRequest", handleApiError(err, { module: "hr" }))
      throw err
    } finally {
      setFnLoading("updateLeaveRequest", false)
    }
  }, [useCase, t, idem])

  const processLeaveRequest = useCallback(async (id: number, operation: LeaveRequestProcessOperations, reviewNotes: string) => {
    setFnLoading("processLeaveRequest", true)
    setFnError("processLeaveRequest", null)
    try {
      await idem.run('process', { id, operation, reviewNotes }, (key) => useCase.processleaveRequest(id, operation, reviewNotes, key))
      toast.success(t("leave_request.process_success", "hr"))
    } catch (err: any) {
      setFnError("processLeaveRequest", handleApiError(err, { module: "hr" }))
      throw err
    } finally {
      setFnLoading("processLeaveRequest", false)
    }
  }, [useCase, t, idem])

  const isLoading = useCallback(() => Object.values(loading).some(Boolean), [loading])
  const hasErrors = useCallback(() => Object.values(error).some((e) => e !== null), [error])



  return {
    myLeaveRequests,
    employeeLeaveRequests,
    currentLeaveRequest,
    loading,
    isLoading,
    error,
    hasErrors,
    pagination,
    filter,
    setFilter,
    resetFilter,
    clearError,
    findAllMyLeaveRequests,
    findAllEmployeeLeaveRequests,
    findLeaveRequestById,
    createLeaveRequest,
    updateLeaveRequest,
    processLeaveRequest,
    setSearch,
    setPage,
  }
}
