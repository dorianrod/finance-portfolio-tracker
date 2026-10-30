type PortfolioSourceResource =
  | 'dashboard'
  | 'all-positions'
  | 'operations'
  | 'saving-capacity-source'
  | 'account-savings-source'
  | 'positions-history'
  | 'portfolio-history'
  | 'cash-history'
  | 'annual-income-savings'
  | 'demo-filtered-history-accounts'
  | 'fund-holdings'
  | 'fund-diagnostics'
  | 'manual-price-overrides'
  | 'monthly-operations'
  | 'pipeline-errors'
  | 'raw-isin-allocation'
  | 'allocation-by-isin'

type PortfolioQueryScopes = Record<PortfolioSourceResource, []> & {
  'filtered-history': string[]
  'saving-capacity': [accounts: readonly string[]]
  'passive-income': [
    accounts: readonly string[],
    dateFrom: Date | undefined,
    dateTo: Date | undefined,
  ]
  'asset-irr': [
    accounts: readonly string[],
    accountTypes: readonly string[],
    dateFrom: Date | undefined,
    dateTo: Date | undefined,
  ]
}

export const portfolioQueryKeys = {
  all: ['portfolio'] as const,
  data: <TResource extends keyof PortfolioQueryScopes>(
    resource: TResource,
    ...scope: PortfolioQueryScopes[TResource]
  ) => ['portfolio', 'data', resource, ...scope] as const,
}
