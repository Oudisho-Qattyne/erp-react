import { useState, useCallback, useEffect } from "react"
import { useApiClient } from "../../../../../core/presentation/context/api/ApiClinetProvider"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { createLeaveTypeRepository } from "../../../infrastructure/leave/repository"
import { createManageLeaveTypesUseCase } from "../../../application/usecases/leave/manageLeaveTypesUseCase"
import type { FilterLeaveDto } from "../../../application/dtos/leave/filterLeaveDto"
import type { CreateLeaveTypeDto, UpdateLeaveTypeDto } from "../../../application/dtos/leave/LeaveTypeDto"
import type { EntityWithNameOnly } from "../../../../../core/domain/entities/EntityWithNameOnly"
import type { Leave } from "../../../domain/entities/leave/leave"
import { toast } from "sonner"

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
  setFilter: (patch: Partial<FilterLeaveDto>) => void
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
  const { language } = useLanguage()

  const [items, setItems] = useState<EntityWithNameOnly[]>([])
  const [userEligibleLeaveTypes, setUserEligibleLeaveTypes] = useState<EntityWithNameOnly[]>([])
  const [currentLeave, setCurrentLeave] = useState<Leave | null>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>(() => initRecord(false))
  const [error, setError] = useState<Record<string, string | null>>(() => initRecord(null))
  const [filter, setFilterState] = useState<FilterLeaveDto>(DEFAULT_FILTER)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, hasMore: false })

  const repository = createLeaveTypeRepository(apiClient)
  const useCase = createManageLeaveTypesUseCase(repository)

  const setFnLoading = (fn: string, v: boolean) => setLoading((p) => ({ ...p, [fn]: v }))
  const setFnError = (fn: string, e: string | null) => setError((p) => ({ ...p, [fn]: e }))

  const clearError = useCallback(() => setError(initRecord(null)), [])

  const setFilter = useCallback((patch: Partial<FilterLeaveDto>) => {
    setFilterState((prev) => ({ ...prev, ...patch }))
  }, [])

  const resetFilter = useCallback(() => setFilterState(DEFAULT_FILTER), [])

  const setSearch = useCallback((search: string) => {
    setFilterState((prev) => ({ ...prev, search, page: 1 }))
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
        currentPage: res.currentPage || 1,
        lastPage: res.lastPage || 1,
        total: (res.total as any) || 0,
        hasMore: res.hasMore || false,
      })
    } catch (err: any) {
      const msg = err.message || "Failed to fetch leave types"
      setFnError("findAll", msg)
      toast.error(language === "ar" ? `فشل تحميل أنواع الإجازات: ${msg}` : `Failed to load leave types: ${msg}`)
    } finally {
      setFnLoading("findAll", false)
    }
  }, [useCase, filter, language])

  const findById = useCallback(async (id: number) => {
    setFnLoading("findById", true)
    setFnError("findById", null)
    try {
      const res = await useCase.findLeaveTypeById(id)
      const data = res.data
      setCurrentLeave(Array.isArray(data) ? data[0] : data as any)
    } catch (err: any) {
      const msg = err.message || "Failed to fetch leave type"
      setFnError("findById", msg)
      toast.error(language === "ar" ? `فشل تحميل الإجازة: ${msg}` : `Failed to load leave type: ${msg}`)
    } finally {
      setFnLoading("findById", false)
    }
  }, [useCase, language])

  const create = useCallback(async (data: CreateLeaveTypeDto) => {
    setFnLoading("create", true)
    setFnError("create", null)
    try {
      await useCase.createLeaveType(data)
      toast.success(language === "ar" ? "تم إنشاء الإجازة بنجاح" : "Leave type created successfully")
    } catch (err: any) {
      const msg = err.message || "Failed to create leave type"
      setFnError("create", msg)
      toast.error(language === "ar" ? `فشل إنشاء الإجازة: ${msg}` : `Failed to create leave type: ${msg}`)
      throw err
    } finally {
      setFnLoading("create", false)
    }
  }, [useCase, language])

  const update = useCallback(async (id: number, data: UpdateLeaveTypeDto) => {
    setFnLoading("update", true)
    setFnError("update", null)
    try {
      await useCase.updateLeaveType(id, data)
      toast.success(language === "ar" ? "تم تحديث الإجازة بنجاح" : "Leave type updated successfully")
    } catch (err: any) {
      const msg = err.message || "Failed to update leave type"
      setFnError("update", msg)
      toast.error(language === "ar" ? `فشل تحديث الإجازة: ${msg}` : `Failed to update leave type: ${msg}`)
      throw err
    } finally {
      setFnLoading("update", false)
    }
  }, [useCase, language])

  const archive = useCallback(async (id: number) => {
    setFnLoading("archive", true)
    setFnError("archive", null)
    try {
      await useCase.archiveLeaveType(id)
      toast.success(language === "ar" ? "تم أرشفة الإجازة بنجاح" : "Leave type archived successfully")
      await findAll()
    } catch (err: any) {
      const msg = err.message || "Failed to archive leave type"
      setFnError("archive", msg)
      toast.error(language === "ar" ? `فشل أرشفة الإجازة: ${msg}` : `Failed to archive leave type: ${msg}`)
      throw err
    } finally {
      setFnLoading("archive", false)
    }
  }, [useCase, language, findAll])

  const deleteFn = useCallback(async (id: number) => {
    setFnLoading("delete", true)
    setFnError("delete", null)
    try {
      await useCase.deleteLeaveType(id)
      toast.success(language === "ar" ? "تم حذف الإجازة بنجاح" : "Leave type deleted successfully")
      await findAll()
    } catch (err: any) {
      const msg = err.message || "Failed to delete leave type"
      setFnError("delete", msg)
      toast.error(language === "ar" ? `فشل حذف الإجازة: ${msg}` : `Failed to delete leave type: ${msg}`)
      throw err
    } finally {
      setFnLoading("delete", false)
    }
  }, [useCase, language, findAll])

  const findUserEligibleLeaveTypesFn = useCallback(async () => {
    setFnLoading("findUserEligibleLeaveTypes", true)
    setFnError("findUserEligibleLeaveTypes", null)
    try {
      const res = await useCase.findUserEligibleLeaveTypes()
      setUserEligibleLeaveTypes(res.data)
    } catch (err: any) {
      const msg = err.message || "Failed to fetch eligible leave types"
      setFnError("findUserEligibleLeaveTypes", msg)
      toast.error(language === "ar" ? `فشل تحميل أنواع الإجازات المستحقة: ${msg}` : `Failed to load eligible leave types: ${msg}`)
    } finally {
      setFnLoading("findUserEligibleLeaveTypes", false)
    }
  }, [useCase, language])

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
