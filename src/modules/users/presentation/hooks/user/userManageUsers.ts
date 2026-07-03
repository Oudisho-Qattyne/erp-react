import { useState, useCallback, useEffect } from "react"
import { useApiClient } from "../../../../../core/presentation/context/api/ApiClinetProvider"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { createUserRepository } from "../../../infrastructure/repositories/user/repository"
import { createManageUserUseCase } from "../../../application/usecases/user/manageUserUsecase"
import type { User } from "../../../domain/entities/user/user"
import type { FilterUserDto } from "../../../application/dtos/user/filterUserDto"
import type { CreateUserDto, UpdateuserDto } from "../../../application/dtos/user/userDto"
import { toast } from "sonner"

const OP_KEYS = ["getAllUsers", "getCurrentUser", "createUser", "updateUser", "updateSignature", "exportUsersExcel", "exportUsersPdf", "linkUserToEmployee"] as const

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
  updateSignature: (file: File) => Promise<void>
  exportUsersExcel: () => Promise<void>
  exportUsersPdf: () => Promise<void>
  linkUserToEmployee: (userId: number, employeeId: number) => Promise<void>
  setSearch: (search: string) => void
  setPage: (page: number) => void
}

export const useManageUsers = (): UseManageUsersReturn => {
  const apiClient = useApiClient()
  const { language } = useLanguage()

  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>(() => initRecord(false))
  const [error, setError] = useState<Record<string, string | null>>(() => initRecord(null))
  const [filter, setFilterState] = useState<FilterUserDto>(DEFAULT_FILTER)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, hasMore: false })

  const repository = createUserRepository(apiClient)
  const useCase = createManageUserUseCase(repository)

  const setFnLoading = (fn: string, v: boolean) => setLoading((p) => ({ ...p, [fn]: v }))
  const setFnError = (fn: string, e: string | null) => setError((p) => ({ ...p, [fn]: e }))

  const clearError = useCallback(() => setError(initRecord(null)), [])

  const setFilter = useCallback((patch: Partial<FilterUserDto> | ((prev: FilterUserDto) => FilterUserDto)) => {
    setFilterState((prev) => typeof patch === "function" ? patch(prev) : { ...prev, ...patch })
  }, [])

  const resetFilter = useCallback(() => setFilterState(DEFAULT_FILTER), [])

  const setSearch = useCallback((search: string) => {
    setFilterState((prev) => ({ ...prev, search: search as any, page: 1 }))
  }, [])

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
      const msg = err.message || "Failed to fetch users"
      setFnError("getAllUsers", msg)
      toast.error(language === "ar" ? `فشل تحميل المستخدمين: ${msg}` : `Failed to load users: ${msg}`)
    } finally {
      setFnLoading("getAllUsers", false)
    }
  }, [useCase, filter, language])

  const getCurrentUser = useCallback(async () => {
    setFnLoading("getCurrentUser", true)
    setFnError("getCurrentUser", null)
    try {
      const res = await useCase.getCurrentUser()
      setCurrentUser(res.data)
    } catch (err: any) {
      const msg = err.message || "Failed to fetch current user"
      setFnError("getCurrentUser", msg)
      toast.error(language === "ar" ? `فشل تحميل بيانات المستخدم: ${msg}` : `Failed to load user data: ${msg}`)
    } finally {
      setFnLoading("getCurrentUser", false)
    }
  }, [useCase, language])

  const createUser = useCallback(async (data: CreateUserDto) => {
    setFnLoading("createUser", true)
    setFnError("createUser", null)
    try {
      await useCase.createUser(data)
      toast.success(language === "ar" ? "تم إنشاء المستخدم بنجاح" : "User created successfully")
      await getAllUsers()
    } catch (err: any) {
      const msg = err.message || "Failed to create user"
      setFnError("createUser", msg)
      toast.error(language === "ar" ? `فشل إنشاء المستخدم: ${msg}` : `Failed to create user: ${msg}`)
      throw err
    } finally {
      setFnLoading("createUser", false)
    }
  }, [useCase, language, getAllUsers])

  const updateUser = useCallback(async (id: number, data: UpdateuserDto) => {
    setFnLoading("updateUser", true)
    setFnError("updateUser", null)
    try {
      await useCase.updateUser(id, data)
      toast.success(language === "ar" ? "تم تحديث المستخدم بنجاح" : "User updated successfully")
      await getAllUsers()
    } catch (err: any) {
      const msg = err.message || "Failed to update user"
      setFnError("updateUser", msg)
      toast.error(language === "ar" ? `فشل تحديث المستخدم: ${msg}` : `Failed to update user: ${msg}`)
      throw err
    } finally {
      setFnLoading("updateUser", false)
    }
  }, [useCase, language, getAllUsers])

  const updateSignature = useCallback(async (file: File) => {
    setFnLoading("updateSignature", true)
    setFnError("updateSignature", null)
    try {
      await useCase.updateSignature(file)
      toast.success(language === "ar" ? "تم تحديث التوقيع بنجاح" : "Signature updated successfully")
    } catch (err: any) {
      const msg = err.message || "Failed to update signature"
      setFnError("updateSignature", msg)
      toast.error(language === "ar" ? `فشل تحديث التوقيع: ${msg}` : `Failed to update signature: ${msg}`)
      throw err
    } finally {
      setFnLoading("updateSignature", false)
    }
  }, [useCase, language])

  const exportUsersExcel = useCallback(async () => {
    setFnLoading("exportUsersExcel", true)
    setFnError("exportUsersExcel", null)
    try {
      const res = await useCase.exportUsersExcel()
      const blob = res as any
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "users.xlsx"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(language === "ar" ? "تم تصدير المستخدمين بنجاح" : "Users exported successfully")
    } catch (err: any) {
      const msg = err.message || "Failed to export users"
      setFnError("exportUsersExcel", msg)
      toast.error(language === "ar" ? `فشل تصدير المستخدمين: ${msg}` : `Failed to export users: ${msg}`)
      throw err
    } finally {
      setFnLoading("exportUsersExcel", false)
    }
  }, [useCase, language])

  const exportUsersPdf = useCallback(async () => {
    setFnLoading("exportUsersPdf", true)
    setFnError("exportUsersPdf", null)
    try {
      const res = await useCase.exportUsersPdf()
      const blob = res as any
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "users.pdf"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(language === "ar" ? "تم تصدير المستخدمين بنجاح" : "Users exported successfully")
    } catch (err: any) {
      const msg = err.message || "Failed to export users"
      setFnError("exportUsersPdf", msg)
      toast.error(language === "ar" ? `فشل تصدير المستخدمين: ${msg}` : `Failed to export users: ${msg}`)
      throw err
    } finally {
      setFnLoading("exportUsersPdf", false)
    }
  }, [useCase, language])

  const linkUserToEmployee = useCallback(async (userId: number, employeeId: number) => {
    setFnLoading("linkUserToEmployee", true)
    setFnError("linkUserToEmployee", null)
    try {
      await useCase.linkUserToEmployee(userId, employeeId)
      toast.success(language === "ar" ? "تم ربط المستخدم بالموظف بنجاح" : "User linked to employee successfully")
    } catch (err: any) {
      const msg = err.message || "Failed to link user to employee"
      setFnError("linkUserToEmployee", msg)
      toast.error(language === "ar" ? `فشل ربط المستخدم بالموظف: ${msg}` : `Failed to link user to employee: ${msg}`)
      throw err
    } finally {
      setFnLoading("linkUserToEmployee", false)
    }
  }, [useCase, language])


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
    updateSignature,
    exportUsersExcel,
    exportUsersPdf,
    linkUserToEmployee,
    setSearch,
    setPage,
  }
}
