import { useState, useCallback, useEffect } from "react"
import { useApiClient } from "../../../../../core/presentation/context/api/ApiClinetProvider"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { createLeaveTypeRepository } from "../../../infrastructure/leave/repository"
import { createManageLeaveTypesUseCase } from "../../../application/usecases/leave/manageLeaveTypesUseCase"
import { handleApiError } from "../../../../../core/presentation/utils/handleApiError"
import type { FilterLeaveDto } from "../../../application/dtos/leave/filterLeaveDto"
import type { CreateLeaveTypeDto, UpdateLeaveTypeDto } from "../../../application/dtos/leave/LeaveTypeDto"
import type { EntityWithNameOnly } from "../../../../../core/domain/entities/EntityWithNameOnly"
import type { Leave } from "../../../domain/entities/leave/leave"
import { toast } from "sonner"
import { useIdempotency } from "../../../../../core/presentation/hooks/useIdempotency"

const OP_KEYS = ["findAll", "findById", "create", "update", "archive", "delete", "findUserEligibleLeaveTypes"] as const

function initRecord<T>(value: T): Record<string, T> {
  return Object.fromEntries(OP_KEYS.map((k) => [k, value]))
}

const DEFAULT_FILTER: FilterLeaveDto = {
  page: 1,
  per_page: 25,
  search: "",
  unit: "" as any,
//   balance_mode: "" as any,
//   accrual_period: "" as any,
//   is_paid: undefined as any,
//   is_active: undefined as any,
//   requires_approval: undefined as any,
//   allow_half_day: undefined as any,
//   allow_hourly: undefined as any,
//   allow_split: undefined as any,
//   "sort_by[name]": "asc",
//   "sort_by[created_at]": "desc",
}

export interface UseLeaveTypesReturn {
  items: EntityWithNameOnly[]
  userEligibleLeaveTypes: EntityWithNameOnly[]
  currentLeave: Leave | null
  loading: Record<string, boolean>
  isLoading: () => boolean
  error: Record<string, string | null>
  hasErrors: () => boolean
  pagination: {
    currentPage: number
    lastPage: number
    total: number
    hasMore: boolean
  }
  filter: FilterLeaveDto
  setFilter: (patch: Partial<FilterLeaveDto> | ((prev: FilterLeaveDto) => FilterLeaveDto)) => void
  resetFilter: () => void
  clearError: () => void
  findAll: () => Promise<void>
  findById: (id: number) => Promise<void>
  create: (data: CreateLeaveTypeDto) => Promise<void>
  update: (id: number, data: UpdateLeaveTypeDto) => Promise<void>
  archive: (id: number) => Promise<void>
  delete: (id: number) => Promise<void>
  setSearch: (search: string) => void
  setPage: (page: number) => void
  setSort: (field: "name" | "created_at", dir: "asc" | "desc") => void
  findUserEligibleLeaveTypes: () => Promise<void>
}

export const useLeaveTypes = (): UseLeaveTypesReturn => {
  const apiClient = useApiClient()
  const { t } = useLanguage()

  const [items, setItems] = useState<EntityWithNameOnly[]>([])
  const [userEligibleLeaveTypes, setUserEligibleLeaveTypes] = useState<EntityWithNameOnly[]>([])
  const [currentLeave, setCurrentLeave] = useState<Leave | null>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>(() => initRecord(false))
  const [error, setError] = useState<Record<string, string | null>>(() => initRecord(null))
  const [filter, setFilterState] = useState<FilterLeaveDto>(DEFAULT_FILTER)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, hasMore: false })

  const repository = createLeaveTypeRepository(apiClient)
  const useCase = createManageLeaveTypesUseCase(repository)
  const idem = useIdempotency()

  const setFnLoading = (fn: string, v: boolean) => setLoading((p) => ({ ...p, [fn]: v }))
  const setFnError = (fn: string, e: string | null) => setError((p) => ({ ...p, [fn]: e }))

  const clearError = useCallback(() => setError(initRecord(null)), [])

  const setFilter = useCallback((patch: Partial<FilterLeaveDto> | ((prev: FilterLeaveDto) => FilterLeaveDto)) => {
    setFilterState((prev) => (typeof patch === "function" ? patch(prev) : { ...prev, ...patch }))
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

  const setSort = useCallback((field: "name" | "created_at", dir: "asc" | "desc") => {
    setFilterState((prev) => ({
      ...prev,
      "sort_by[name]": field === "name" ? dir : prev["sort_by[name]"],
      "sort_by[created_at]": field === "created_at" ? dir : prev["sort_by[created_at]"],
    }))
  }, [])

  const findAll = useCallback(async () => {
    setFnLoading("findAll", true)
    setFnError("findAll", null)
    try {
      const res = await useCase.findAllLeaveTypes(filter)
      setItems(res.data)
      setPagination({
        currentPage: res.pagination?.currentPage || 1,
        lastPage: res.pagination?.lastPage || 1,
        total: res.pagination?.total || 0,
        hasMore: res.pagination?.hasMore || false,
      })
    } catch (err: any) {
      setFnError("findAll", handleApiError(err, { module: "hr" , passThrough:true } ))
    } finally {
      setFnLoading("findAll", false)
    }
  }, [useCase, filter])

  const findById = useCallback(async (id: number) => {
    setFnLoading("findById", true)
    setFnError("findById", null)
    try {
      const res = await useCase.findLeaveTypeById(id)
      const data = res.data
      setCurrentLeave(Array.isArray(data) ? data[0] : data as any)
    } catch (err: any) {
      setFnError("findById", handleApiError(err, { module: "hr" }))
    } finally {
      setFnLoading("findById", false)
    }
  }, [useCase])

  const create = useCallback(async (data: CreateLeaveTypeDto) => {
    setFnLoading("create", true)
    setFnError("create", null)
    try {
      await idem.run('create', data, (key) => useCase.createLeaveType(data, key))
      toast.success(t("leave_types.created", "hr"))
    } catch (err: any) {
      setFnError("create", handleApiError(err, { module: "hr" }))
      throw err
    } finally {
      setFnLoading("create", false)
    }
  }, [useCase, t, idem])

  const update = useCallback(async (id: number, data: UpdateLeaveTypeDto) => {
    setFnLoading("update", true)
    setFnError("update", null)
    try {
      await idem.run('update', { id, data }, (key) => useCase.updateLeaveType(id, data, key))
      toast.success(t("leave_types.updated", "hr"))
    } catch (err: any) {
      setFnError("update", handleApiError(err, { module: "hr" }))
      throw err
    } finally {
      setFnLoading("update", false)
    }
  }, [useCase, t, idem])

  const archive = useCallback(async (id: number) => {
    setFnLoading("archive", true)
    setFnError("archive", null)
    try {
      await idem.run('archive', { id }, (key) => useCase.archiveLeaveType(id, key))
      toast.success(t("leave_types.archived", "hr"))
      await findAll()
    } catch (err: any) {
      setFnError("archive", handleApiError(err, { module: "hr" }))
      throw err
    } finally {
      setFnLoading("archive", false)
    }
  }, [useCase, t, findAll, idem])

  const deleteFn = useCallback(async (id: number) => {
    setFnLoading("delete", true)
    setFnError("delete", null)
    try {
      await useCase.deleteLeaveType(id)
      toast.success(t("leave_types.deleted", "hr"))
      await findAll()
    } catch (err: any) {
      setFnError("delete", handleApiError(err, { module: "hr" }))
      throw err
    } finally {
      setFnLoading("delete", false)
    }
  }, [useCase, t, findAll])

  const findUserEligibleLeaveTypesFn = useCallback(async () => {
    setFnLoading("findUserEligibleLeaveTypes", true)
    setFnError("findUserEligibleLeaveTypes", null)
    try {
      const res = await useCase.findUserEligibleLeaveTypes()
      setUserEligibleLeaveTypes(res.data)
    } catch (err: any) {
      setFnError("findUserEligibleLeaveTypes", handleApiError(err, { module: "hr" , passThrough:true }))
    } finally {
      setFnLoading("findUserEligibleLeaveTypes", false)
    }
  }, [useCase])

  const isLoading = useCallback(() => Object.values(loading).some(Boolean), [loading])
  const hasErrors = useCallback(() => Object.values(error).some((e) => e !== null), [error])

  useEffect(() => {
    findAll()
  }, [filter])

  return {
    items,
    userEligibleLeaveTypes,
    currentLeave,
    loading,
    isLoading,
    error,
    hasErrors,
    pagination,
    filter,
    setFilter,
    resetFilter,
    clearError,
    findAll,
    findById,
    create,
    update,
    archive,
    delete: deleteFn,
    setSearch,
    setPage,
    setSort,
    findUserEligibleLeaveTypes: findUserEligibleLeaveTypesFn,
  }
}
