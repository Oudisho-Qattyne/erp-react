import { useCallback } from 'react'
import { getPersonsHook, type PersonSearchResult, type PersonsHookResult } from './personRegistry'

export interface UsePersonsFromRegistry extends PersonsHookResult {
  isRegistered: boolean
}

const NullPersonsHook = (): PersonsHookResult => ({
  searchPersons: async () => [],
})

export const usePersons = (): UsePersonsFromRegistry => {
  const registeredHook = getPersonsHook()
  const hook = registeredHook ?? NullPersonsHook
  const result = hook()

  const isRegistered = registeredHook !== null
  const search = result.searchPersons

  const searchPersons = useCallback(
    async (query: string, perPage = 10): Promise<PersonSearchResult[]> => {
      try {
        return await search(query, perPage)
      } catch {
        return []
      }
    },
    [search]
  )

  return { isRegistered, searchPersons }
}