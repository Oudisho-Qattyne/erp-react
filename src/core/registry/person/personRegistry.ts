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