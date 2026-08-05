import { useState, useCallback, useEffect } from "react"
import { useApiClient } from "../../../../../core/presentation/context/api/ApiClinetProvider"
import { createEmployeeRepository } from "../../../infrastructure/employee/repository"
import { createManageEmployeeUseCase } from "../../../application/usecases/employee/manageEmployeeUseCase"
import { handleApiError } from "../../../../../core/presentation/utils/handleApiError"
import type { EmployeeListItem } from "../../../domain/entities/EmployeeListItem"
import type { EmployeeStatusLog } from "../../../domain/entities/employeeStatus/employeeStatusLog"
import type { JobStatusLog } from "../../../domain/entities/jobStatus/JobStatusLog"
import type { FilterEmployeeDto } from "../../../application/dtos/employee/FilterEmployeeDto"

const MODULE = "hr"

const OP_KEYS = ["findEmployeeStatusLogs", "findJobStatusLogs", "findAllEmployees"] as const

function initRecord<T>(value: T): Record<string, T> {
  return Object.fromEntries(OP_KEYS.map((k) => [k, value]))
}

const DEFAULT_FILTER: FilterEmployeeDto = {
  page: 1,
  per_page: 25,
}

export interface UseEmployeeReturn {
  employees: EmployeeListItem[]
  employeeStatusLogs: EmployeeStatusLog[]
  jobStatusLogs: JobStatusLog[]
  loading: Record<string, boolean>
  error: Record<string, string | null>
  pagination: { currentPage: number; lastPage: number; total: number; hasMore: boolean }
  filter: FilterEmployeeDto
  setFilter: (patch: Partial<FilterEmployeeDto> | ((prev: FilterEmployeeDto) => FilterEmployeeDto)) => void
  resetFilter: () => void
  employeeStatusPagination: { currentPage: number; lastPage: number; total: number; hasMore: boolean }
  jobStatusPagination: { currentPage: number; lastPage: number; total: number; hasMore: boolean }
  employeeStatusFilter: { page: number; per_page: number }
  jobStatusFilter: { page: number; per_page: number }
  setEmployeeStatusPage: (page: number) => void
  setJobStatusPage: (page: number) => void
  findEmployeeStatusLogs: (employeeId: number) => Promise<void>
  findJobStatusLogs: (employeeId: number) => Promise<void>
  findAllEmployees: () => Promise<void>
  setSearch: (search: string) => void
  setPage: (page: number) => void
}

export const useEmployee = (): UseEmployeeReturn => {
  const apiClient = useApiClient()

  const [employees, setEmployees] = useState<EmployeeListItem[]>([])
  const [employeeStatusLogs, setEmployeeStatusLogs] = useState<EmployeeStatusLog[]>([])
  const [jobStatusLogs, setJobStatusLogs] = useState<JobStatusLog[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>(() => initRecord(false))
  const [error, setError] = useState<Record<string, string | null>>(() => initRecord(null))
  const [filter, setFilterState] = useState<FilterEmployeeDto>(DEFAULT_FILTER)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, hasMore: false })
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState(DEFAULT_FILTER)
  const [jobStatusFilter, setJobStatusFilter] = useState(DEFAULT_FILTER)
  const [employeeStatusPagination, setEmployeeStatusPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, hasMore: false })
  const [jobStatusPagination, setJobStatusPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, hasMore: false })

  const repository = createEmployeeRepository(apiClient)
  const useCase = createManageEmployeeUseCase(repository)

  const setFnLoading = (fn: string, v: boolean) => setLoading((p) => ({ ...p, [fn]: v }))
  const setFnError = (fn: string, e: string | null) => setError((p) => ({ ...p, [fn]: e }))

  const setFilter = useCallback((patch: Partial<FilterEmployeeDto> | ((prev: FilterEmployeeDto) => FilterEmployeeDto)) => {
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

  const setEmployeeStatusPage = useCallback((page: number) => {
    setEmployeeStatusFilter((prev) => ({ ...prev, page }))
  }, [])

  const setJobStatusPage = useCallback((page: number) => {
    setJobStatusFilter((prev) => ({ ...prev, page }))
  }, [])

  const findAllEmployees = useCallback(async () => {
    setFnLoading("findAllEmployees", true)
    setFnError("findAllEmployees", null)
    try {
      const res = await useCase.findAllEmployees(filter)
      setEmployees(res.data)
      setPagination({
        currentPage: res.currentPage || 1,
        lastPage: res.lastPage || 1,
        total: (res.total as any) || 0,
        hasMore: res.hasMore || false,
      })
    } catch (err: any) {
      setFnError("findAllEmployees", handleApiError(err, { module: MODULE }))
    } finally {
      setFnLoading("findAllEmployees", false)
    }
  }, [useCase, filter])

  const findEmployeeStatusLogs = useCallback(async (employeeId: number) => {
    setFnLoading("findEmployeeStatusLogs", true)
    setFnError("findEmployeeStatusLogs", null)
    try {
      const res = await useCase.findEmployeeStatusLogs(employeeId, employeeStatusFilter)
      setEmployeeStatusLogs(res.data)
      setEmployeeStatusPagination({
        currentPage: res.currentPage || 1,
        lastPage: res.lastPage || 1,
        total: res.total as any || 0,
        hasMore: res.hasMore || false,
      })
    } catch (err: any) {
      setFnError("findEmployeeStatusLogs", handleApiError(err, { module: MODULE }))
    } finally {
      setFnLoading("findEmployeeStatusLogs", false)
    }
  }, [useCase, employeeStatusFilter])

  const findJobStatusLogs = useCallback(async (employeeId: number) => {
    setFnLoading("findJobStatusLogs", true)
    setFnError("findJobStatusLogs", null)
    try {
      const res = await useCase.findJobStatusLogs(employeeId, jobStatusFilter)
      setJobStatusLogs(res.data)
      setJobStatusPagination({
        currentPage: res.currentPage || 1,
        lastPage: res.lastPage || 1,
        total: res.total as any || 0,
        hasMore: res.hasMore || false,
      })
    } catch (err: any) {
      setFnError("findJobStatusLogs", handleApiError(err, { module: MODULE }))
    } finally {
      setFnLoading("findJobStatusLogs", false)
    }
  }, [useCase, jobStatusFilter])

  useEffect(() => {
    findAllEmployees()
  }, [filter])

  return {
    employees,
    employeeStatusLogs,
    jobStatusLogs,
    loading,
    error,
    pagination,
    filter,
    setFilter,
    resetFilter,
    employeeStatusPagination,
    jobStatusPagination,
    employeeStatusFilter,
    jobStatusFilter,
    setEmployeeStatusPage,
    setJobStatusPage,
    findEmployeeStatusLogs,
    findJobStatusLogs,
    findAllEmployees,
    setSearch,
    setPage,
  }
}
