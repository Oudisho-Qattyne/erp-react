import { useState, useCallback, useEffect } from "react"
import { useApiClient } from "../../../../core/presentation/context/api/ApiClinetProvider"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { createPersonRepository } from "../../infrastructure/repositories/PersonRepository"
import { createManagePersonsUseCase } from "../../application/usecases/managePersonsUseCase"
import type { PersonFilters } from "../../application/dtos/personDtos"
import type { Person } from "../../domain/entities/Person"
import { toast } from "sonner"

const MODULE = "crm"

const OP_KEYS = ["findAllPersons", "findPersonById"] as const

function initRecord<T>(value: T): Record<string, T> {
  return Object.fromEntries(OP_KEYS.map((k) => [k, value]))
}

export interface UsePersonsReturn {
  persons: Person[]
  person: Person | null
  setPerson: (person: Person | null) => void
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
  findPersonById: (id: number) => Promise<void>
}

export const usePersons = (): UsePersonsReturn => {
  const apiClient = useApiClient()
  const { t } = useLanguage()

  const [persons, setPersons] = useState<Person[]>([])
  const [person, setPerson] = useState<Person | null>(null)
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
        currentPage: res.currentPage || 1,
        lastPage: res.lastPage || 1,
        total: Number(res.total) || 0,
        hasMore: res.hasMore || false,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("person.load_error", MODULE) || "Failed to load persons"
      setFnError("findAllPersons", msg)
      toast.error(msg)
    } finally {
      setFnLoading("findAllPersons", false)
    }
  }, [useCase, filter, t])

  const findPersonById = useCallback(async (id: number) => {
    setFnLoading("findPersonById", true)
    setFnError("findPersonById", null)
    try {
      const res = await useCase.findPersonById(id)
      setPerson(res?.data ?? null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("person.load_error", MODULE) || "Failed to load person"
      setFnError("findPersonById", msg)
      toast.error(msg)
      throw err
    } finally {
      setFnLoading("findPersonById", false)
    }
  }, [useCase, t])

  const isLoading = useCallback(() => Object.values(loading).some(Boolean), [loading])
  const hasErrors = useCallback(() => Object.values(error).some((e) => e !== null), [error])

  return {
    persons,
    person,
    setPerson,
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
    findPersonById,
  }
}
