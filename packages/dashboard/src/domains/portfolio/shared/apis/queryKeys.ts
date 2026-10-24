type PortfolioResource =
  | 'dashboard'
  | 'all-positions'
  | 'positions-history'
  | 'portfolio-history'
  | 'cash-history'
  | 'annual-income-savings'
  | 'asset-irr'
  | 'filtered-history'
  | 'demo-filtered-history-accounts'
  | 'fund-holdings'
  | 'manual-price-overrides'
  | 'monthly-operations'
  | 'passive-income'
  | 'pipeline-errors'
  | 'raw-isin-allocation'
  | 'allocation-by-isin'
  | 'saving-capacity'

export const portfolioQueryKeys = {
  all: ['portfolio'] as const,
  data: (resource: PortfolioResource, ...scope: ReadonlyArray<unknown>) =>
    ['portfolio', 'data', resource, ...scope] as const,
}
