import { useState, useCallback, useEffect, useMemo } from "react"
import { useApiClient } from "../../../../core/presentation/context/api/ApiClinetProvider"
import { createPersonRepository } from "../../infrastructure/repositories/PersonRepository"
import { createManagePersonsUseCase } from "../../application/usecases/managePersonsUseCase"
import { handleApiError } from "../../../../core/presentation/utils/handleApiError"
import type { PersonFilters } from "../../application/dtos/personDtos"
import type { Person } from "../../domain/entities/Person"
import type { PersonSearchResult } from "../../../../core/registry/person/personRegistry"

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
  sortColumn: string | undefined
  sortOrder: "asc" | "desc" | undefined
  setFilter: (patch: Partial<PersonFilters>) => void
  resetFilter: () => void
  setPage: (page: number) => void
  setSort: (column: string) => void
  findAllPersons: () => Promise<void>
  searchPersons: (query: string, perPage?: number) => Promise<PersonSearchResult[]>
}

export const usePersons = (): UsePersonsReturn => {
  const apiClient = useApiClient()

  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>(() => initRecord(false))
  const [error, setError] = useState<Record<string, string | null>>(() => initRecord(null))
  const [filter, setFilterState] = useState<PersonFilters>({})
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, hasMore: false })

  const useCase = useMemo(
    () => createManagePersonsUseCase(createPersonRepository(apiClient)),
    [apiClient]
  )

  const setFnLoading = (fn: string, v: boolean) => setLoading((p) => ({ ...p, [fn]: v }))
  const setFnError = (fn: string, e: string | null) => setError((p) => ({ ...p, [fn]: e }))

  const clearError = useCallback(() => setError(initRecord(null)), [])

  const setFilter = useCallback((patch: Partial<PersonFilters>) => {
    setFilterState((prev) => ({ ...prev, ...patch, page: 1 }))
  }, [])

  const resetFilter = useCallback(() => setFilterState({}), [])

  const setPage = useCallback((page: number) => {
    setFilterState((prev) => ({ ...prev, page }))
  }, [])

  const setSort = useCallback((column: string) => {
    setFilterState((prev) => ({
      ...prev,
      sortColumn: column,
      sortOrder: prev.sortColumn === column && prev.sortOrder === "asc" ? "desc" : "asc",
      page: 1,
    }))
  }, [])

  const buildListParams = useCallback((): Record<string, string | number> | undefined => {
    const params: Record<string, string | number> = {}
    for (const [key, val] of Object.entries(filter)) {
      if (key === "sortColumn" || key === "sortOrder") continue
      if (val !== undefined && val !== "") params[key] = String(val)
    }
    if (filter.sortColumn) {
      params[`sort_by[${filter.sortColumn}]`] = filter.sortOrder ?? "asc"
    }
    return Object.keys(params).length ? params : undefined
  }, [filter])

  const findAllPersons = useCallback(async () => {
    setFnLoading("findAllPersons", true)
    setFnError("findAllPersons", null)
    try {
      const res = await useCase.findAllPersons(buildListParams())
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
  }, [useCase, buildListParams])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    findAllPersons()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const searchPersons = useCallback(
    async (query: string, perPage = 10): Promise<PersonSearchResult[]> => {
      const res = await useCase.findAllPersons({ search: query, per_page: perPage })
      return (res.data )
    },
    [useCase]
  )

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
    sortColumn: filter.sortColumn,
    sortOrder: filter.sortOrder,
    setFilter,
    resetFilter,
    setPage,
    setSort,
    findAllPersons,
    searchPersons,
  }
}