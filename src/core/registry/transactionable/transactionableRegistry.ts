export interface TransactionableRouteConfig {
  /** Polymorphic type string as returned by the API, e.g. "App\\Modules\\Investments\\Domain\\Entities\\PlotDossier" */
  type: string
  /** Builds the detail URL from the linked entity payload (has `id`, `plot_id`, ...). */
  resolve: (entity: Record<string, any>) => string
  permission?: string
}

export interface TransactionableApi {
  getTransactionableRoute: (type: string | undefined) => TransactionableRouteConfig | undefined
  isTransactionableRouteRegistered: (type: string | undefined) => boolean
}

const transactionableTypes: Record<string, TransactionableRouteConfig> = {}

export const registerTransactionableRoute = (config: TransactionableRouteConfig): void => {
  transactionableTypes[config.type] = config
}

const getTransactionableRoute = (type: string | undefined): TransactionableRouteConfig | undefined =>
  type ? transactionableTypes[type] : undefined

const isTransactionableRouteRegistered = (type: string | undefined): boolean =>
  getTransactionableRoute(type) !== undefined

export const getTransactionableApi = (): TransactionableApi => ({
  getTransactionableRoute,
  isTransactionableRouteRegistered,
})
