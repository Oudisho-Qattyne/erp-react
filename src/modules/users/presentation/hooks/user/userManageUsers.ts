import { useState, useCallback, useEffect } from "react"
import { useApiClient } from "../../../../../core/presentation/context/api/ApiClinetProvider"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { createUserRepository } from "../../../infrastructure/repositories/user/repository"
import { createManageUserUseCase } from "../../../application/usecases/user/manageUserUsecase"
import { handleApiError } from "../../../../../core/presentation/utils/handleApiError"
import { useIdempotency } from "../../../../../core/presentation/hooks/useIdempotency"
import type { User } from "../../../domain/entities/user/user"
import type { FilterUserDto } from "../../../application/dtos/user/filterUserDto"
import type { ChangePasswordDto, CreateUserDto, UpdateuserDto } from "../../../application/dtos/user/userDto"
import { toast } from "sonner"

const OP_KEYS = ["getAllUsers", "getCurrentUser", "createUser", "updateUser", "changePassword", "updateSignature", "exportUsersExcel", "exportUsersPdf", "linkUserToEmployee"] as const

function initRecord<T>(value: T): Record<string, T> {
  return Object.fromEntries(OP_KEYS.map((k) => [k, value]))
}

const DEFAULT_FILTER: FilterUserDto = {
  page: 1,
  per_page: 25,
}

export interface UseManageUsersReturn {
  users: User[]
  currentUser: User | null
  loading: Record<string, boolean>
  isLoading: () => boolean
  error: Record<string, string | null>
  hasErrors: () => boolean
  pagination: { currentPage: number; lastPage: number; total: number; hasMore: boolean }
  filter: FilterUserDto
  setFilter: (patch: Partial<FilterUserDto> | ((prev: FilterUserDto) => FilterUserDto)) => void
  resetFilter: () => void
  clearError: () => void
  getAllUsers: () => Promise<void>
  getCurrentUser: () => Promise<void>
  createUser: (data: CreateUserDto) => Promise<void>
  updateUser: (id: number, data: UpdateuserDto) => Promise<void>
  changePassword: (id: number, data:ChangePasswordDto) => Promise<void>
  updateSignature: (file: File) => Promise<void>
  exportUsersExcel: () => Promise<void>
  exportUsersPdf: () => Promise<void>
  linkUserToEmployee: (userId: number, employeeId: number) => Promise<void>
  setPage: (page: number) => void
}

export const useManageUsers = (): UseManageUsersReturn => {
  const apiClient = useApiClient()
  const { t } = useLanguage()

  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>(() => initRecord(false))
  const [error, setError] = useState<Record<string, string | null>>(() => initRecord(null))
  const [filter, setFilterState] = useState<FilterUserDto>(DEFAULT_FILTER)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, hasMore: false })

  const repository = createUserRepository(apiClient)
  const useCase = createManageUserUseCase(repository)
  const idem = useIdempotency()

  const setFnLoading = (fn: string, v: boolean) => setLoading((p) => ({ ...p, [fn]: v }))
  const setFnError = (fn: string, e: string | null) => setError((p) => ({ ...p, [fn]: e }))

  const clearError = useCallback(() => setError(initRecord(null)), [])

  const setFilter = useCallback((patch: Partial<FilterUserDto> | ((prev: FilterUserDto) => FilterUserDto)) => {
    setFilterState((prev) => typeof patch === "function" ? patch(prev) : { ...prev, ...patch })
  }, [])

  const resetFilter = useCallback(() => setFilterState(DEFAULT_FILTER), [])

 

  const setPage = useCallback((page: number) => {
    setFilterState((prev) => ({ ...prev, page }))
  }, [])

  const getAllUsers = useCallback(async () => {
    setFnLoading("getAllUsers", true)
    setFnError("getAllUsers", null)
    try {
      const res = await useCase.getAllUsers(filter)
      setUsers(res.data)
      setPagination({
        currentPage: res.currentPage || 1,
        lastPage: res.lastPage || 1,
        total: (res.total as any) || 0,
        hasMore: res.hasMore || false,
      })
    } catch (err: any) {
      setFnError("getAllUsers", handleApiError(err, { module: "users" }))
    } finally {
      setFnLoading("getAllUsers", false)
    }
  }, [useCase, filter])

  const getCurrentUser = useCallback(async () => {
    setFnLoading("getCurrentUser", true)
    setFnError("getCurrentUser", null)
    try {
      const res = await useCase.getCurrentUser()
      setCurrentUser(res.data)
    } catch (err: any) {
      setFnError("getCurrentUser", handleApiError(err, { module: "users" }))
    } finally {
      setFnLoading("getCurrentUser", false)
    }
  }, [useCase])

  const createUser = useCallback(async (data: CreateUserDto) => {
    setFnLoading("createUser", true)
    setFnError("createUser", null)
    try {
      await idem.run('createUser', data, (key) => useCase.createUser(data, key))
      toast.success(t('users.created', 'users'))
      await getAllUsers()
    } catch (err: any) {
      setFnError("createUser", handleApiError(err, { module: "users" }))
      throw err
    } finally {
      setFnLoading("createUser", false)
    }
  }, [useCase, t, getAllUsers, idem])

  const updateUser = useCallback(async (id: number, data: UpdateuserDto) => {
    setFnLoading("updateUser", true)
    setFnError("updateUser", null)
    try {
      await idem.run('updateUser', { id, data }, (key) => useCase.updateUser(id, data, key))
      toast.success(t('users.updated', 'users'))
      await getAllUsers()
    } catch (err: any) {
      setFnError("updateUser", handleApiError(err, { module: "users" }))
      throw err
    } finally {
      setFnLoading("updateUser", false)
    }
  }, [useCase, t, getAllUsers, idem])

  const changePassword = useCallback(async (id: number, data: ChangePasswordDto) => {
    setFnLoading("changePassword", true)
    setFnError("changePassword", null)
    try {
      await idem.run('changePassword', { id, data }, (key) => useCase.changePassword(id, data, key))
      toast.success(t('users.password_changed', 'users'))
      await getAllUsers()
    } catch (err: any) {
      setFnError("changePassword", handleApiError(err, { module: "users" }))
      throw err
    } finally {
      setFnLoading("changePassword", false)
    }
  }, [useCase, t, getAllUsers, idem])


  const updateSignature = useCallback(async (file: File) => {
    setFnLoading("updateSignature", true)
    setFnError("updateSignature", null)
    try {
      await idem.run('uploadSignature', { signature: file }, (key) => useCase.updateSignature(file, key))
      toast.success(t('users.signature_updated', 'users'))
    } catch (err: any) {
      setFnError("updateSignature", handleApiError(err, { module: "users" }))
      throw err
    } finally {
      setFnLoading("updateSignature", false)
    }
  }, [useCase, t, idem])

  const exportUsersExcel = useCallback(async () => {
    setFnLoading("exportUsersExcel", true)
    setFnError("exportUsersExcel", null)
    try {
      const res = await idem.run('exportExcel', undefined, (key) => useCase.exportUsersExcel(key))
      const blob = res as any
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "users.xlsx"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(t('users.exported', 'users'))
    } catch (err: any) {
      setFnError("exportUsersExcel", handleApiError(err, { module: "users" }))
      throw err
    } finally {
      setFnLoading("exportUsersExcel", false)
    }
  }, [useCase, t, idem])

  const exportUsersPdf = useCallback(async () => {
    setFnLoading("exportUsersPdf", true)
    setFnError("exportUsersPdf", null)
    try {
      const res = await idem.run('exportPdf', undefined, (key) => useCase.exportUsersPdf(key))
      const blob = res as any
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "users.pdf"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(t('users.exported', 'users'))
    } catch (err: any) {
      setFnError("exportUsersPdf", handleApiError(err, { module: "users" }))
      throw err
    } finally {
      setFnLoading("exportUsersPdf", false)
    }
  }, [useCase, t, idem])

  const linkUserToEmployee = useCallback(async (userId: number, employeeId: number) => {
    setFnLoading("linkUserToEmployee", true)
    setFnError("linkUserToEmployee", null)
    try {
      await idem.run('linkUserToEmployee', { userId, employeeId }, (key) => useCase.linkUserToEmployee(userId, employeeId, key))
      toast.success(t('users.linked', 'users'))
    } catch (err: any) {
      setFnError("linkUserToEmployee", handleApiError(err, { module: "users" }))
      throw err
    } finally {
      setFnLoading("linkUserToEmployee", false)
    }
  }, [useCase, t, idem])


  const isLoading = useCallback(() => Object.values(loading).some(Boolean), [loading])
  const hasErrors = useCallback(() => Object.values(error).some((e) => e !== null), [error])

  return {
    users,
    currentUser,
    loading,
    isLoading,
    error,
    hasErrors,
    pagination,
    filter,
    setFilter,
    resetFilter,
    clearError,
    getAllUsers,
    getCurrentUser,
    createUser,
    updateUser,
    changePassword,
    updateSignature,
    exportUsersExcel,
    exportUsersPdf,
    linkUserToEmployee,
    setPage,
  }
}
