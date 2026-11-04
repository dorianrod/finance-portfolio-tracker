import type { PortfolioHistoryPoint } from './portfolioHistoryPoint.type'

// Validated CSV rows keep the source date column before adapting the date field.
export type RawPortfolioHistory = Omit<PortfolioHistoryPoint, 'date'> & {
  snapshot_date: Date
}
