export interface PersonDetailRouteConfig {
  type: string
  routePattern: string
  resolve: (id: number) => string
  permission?: string
}

export interface PersonApi {
  getPersonDetailRoute: (type: string | undefined) => PersonDetailRouteConfig | undefined
  isPersonDetailRouteRegistered: (type: string | undefined) => boolean
}

const personTypes: Record<string, PersonDetailRouteConfig> = {}

export const registerPersonDetailRoute = (config: PersonDetailRouteConfig): void => {
  personTypes[config.type] = config
}

const getPersonDetailRoute = (type: string | undefined): PersonDetailRouteConfig | undefined =>
  type ? personTypes[type] : undefined

const isPersonDetailRouteRegistered = (type: string | undefined): boolean =>
  getPersonDetailRoute(type) !== undefined

export const getPersonApi = (): PersonApi => ({
  getPersonDetailRoute,
  isPersonDetailRouteRegistered,
})

export interface PersonSearchResult {
  id: number
  name: string
  email: string | null
  primary_phone_number: string | null
  whatsapp: string | null
  facebook: string | null
}

export interface PersonsHookResult {
  searchPersons: (query: string, perPage?: number) => Promise<PersonSearchResult[]>
}

export type PersonsHook = () => PersonsHookResult

let personsHook: PersonsHook | null = null

export const registerPersonsHook = (hook: PersonsHook): void => {
  personsHook = hook
}

export const getPersonsHook = (): PersonsHook | null => personsHook