const baseUrl = import.meta.env.BASE_URL
const apiUrl = (path: string) => `${baseUrl}api/${path}`
const dataUrl = (filename: string) => `${baseUrl}data/${filename}`

export const PORTFOLIO_ENDPOINTS = {
  api: {
    assetIrr: apiUrl('asset-irr'),
    portfolioHistory: apiUrl('portfolio-history'),
  },
  data: {
    accounts: dataUrl('accounts.csv'),
    annualIncomeSavings: dataUrl('annual_income_savings.csv'),

    demoFilteredHistory: dataUrl('demo_filtered_history.json'),
    errors: dataUrl('errors.csv'),
    fundHoldings: dataUrl('fund_holdings.csv'),
    fundHoldingsCoverage: dataUrl('fund_holdings_coverage.csv'),
    fundHoldingsHistory: dataUrl('fund_holdings_history.csv'),
    fundHoldingsStatus: dataUrl('fund_holdings_status.csv'),
    fundSnapshotManifest: dataUrl('fund_snapshot_manifest.csv'),
    fundUnresolved: dataUrl('fund_unresolved.csv'),
    manualPriceOverrides: dataUrl('manual_price_overrides.csv'),
    operations: dataUrl('operations.csv'),
    portfolioHistory: dataUrl('portfolio_history.csv'),
    positions: dataUrl('positions.csv'),
    positionsClasse: dataUrl('positions_classe.csv'),
    positionsClasseByIsin: dataUrl('positions_classe_by_isin.csv'),
    positionsCurrency: dataUrl('positions_currency.csv'),
    positionsCurrencyByIsin: dataUrl('positions_currency_by_isin.csv'),
    positionsGeo: dataUrl('positions_geo.csv'),
    positionsGeoByIsin: dataUrl('positions_geo_by_isin.csv'),
    positionsSecteur: dataUrl('positions_secteur.csv'),
    positionsSecteurByIsin: dataUrl('positions_secteur_by_isin.csv'),
    savingCapacity: dataUrl('saving_capacity.csv'),
    savingCapacityByAccount: dataUrl('saving_capacity_by_account.csv'),
  },
} as const
