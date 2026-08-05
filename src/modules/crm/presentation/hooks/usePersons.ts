import { useState, useCallback, useEffect } from "react"
import { useApiClient } from "../../../../core/presentation/context/api/ApiClinetProvider"
import { createPersonRepository } from "../../infrastructure/repositories/PersonRepository"
import { createManagePersonsUseCase } from "../../application/usecases/managePersonsUseCase"
import { handleApiError } from "../../../../core/presentation/utils/handleApiError"
import type { PersonFilters } from "../../application/dtos/personDtos"
import type { Person } from "../../domain/entities/Person"

const MODULE = "crm"

const OP_KEYS = ["findAllPersons"] as const

function initRecord<T>(value: T): Record<string, T> {
  return Object.fromEntries(OP_KEYS.map((k) => [k, value]))
}

export interface UsePersonsReturn {
  persons: Person[]
  loading: Record<string, boolean>
  isLoading: () => boolean
  error: Record<string, string | null>
  hasErrors: () => boolean
  clearError: () => void
  pagination: { currentPage: number; lastPage: number; total: number; hasMore: boolean }
  filter: PersonFilters
  setFilter: (patch: Partial<PersonFilters>) => void
  resetFilter: () => void
  setPage: (page: number) => void
  findAllPersons: () => Promise<void>
}

export const usePersons = (): UsePersonsReturn => {
  const apiClient = useApiClient()

  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>(() => initRecord(false))
  const [error, setError] = useState<Record<string, string | null>>(() => initRecord(null))
  const [filter, setFilterState] = useState<PersonFilters>({})
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, hasMore: false })

  const repository = createPersonRepository(apiClient)
  const useCase = createManagePersonsUseCase(repository)

  const setFnLoading = (fn: string, v: boolean) => setLoading((p) => ({ ...p, [fn]: v }))
  const setFnError = (fn: string, e: string | null) => setError((p) => ({ ...p, [fn]: e }))

  const clearError = useCallback(() => setError(initRecord(null)), [])

  useEffect(() => {
    findAllPersons()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const setFilter = useCallback((patch: Partial<PersonFilters>) => {
    setFilterState((prev) => ({ ...prev, ...patch, page: 1 }))
  }, [])

  const resetFilter = useCallback(() => setFilterState({}), [])

  const setPage = useCallback((page: number) => {
    setFilterState((prev) => ({ ...prev, page }))
  }, [])

  const findAllPersons = useCallback(async () => {
    setFnLoading("findAllPersons", true)
    setFnError("findAllPersons", null)
    try {
      const res = await useCase.findAllPersons(filter)
      setPersons(res.data)
      setPagination({
        currentPage: res.pagination?.currentPage ?? 1,
        lastPage: res.pagination?.lastPage ?? 1,
        total: Number(res.pagination?.total) || 0,
        hasMore: res.pagination?.hasMore ?? false,
      })
    } catch (err: unknown) {
      setFnError("findAllPersons", handleApiError(err, { module: MODULE }))
    } finally {
      setFnLoading("findAllPersons", false)
    }
  }, [useCase, filter])

  const isLoading = useCallback(() => Object.values(loading).some(Boolean), [loading])
  const hasErrors = useCallback(() => Object.values(error).some((e) => e !== null), [error])

  return {
    persons,
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
    findAllPersons,
  }
}