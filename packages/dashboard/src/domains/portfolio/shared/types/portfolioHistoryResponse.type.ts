import type { ApiHistoryPoint } from './apiHistoryPoint.type'

export type PortfolioHistoryResponse = {
  accounts: string[]
  history: ApiHistoryPoint[]
}
