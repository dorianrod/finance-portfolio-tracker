import type { RawPortfolioHistory } from './rawPortfolioHistory.type'

export type PortfolioHistoryResponse = {
  accounts: string[]
  history: RawPortfolioHistory[]
}
