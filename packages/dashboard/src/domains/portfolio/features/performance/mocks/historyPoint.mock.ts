import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

export function historyPoint(
  date: Date,
  tri1y: number | null,
  tri3y: number | null,
): PortfolioHistoryPoint {
  return {
    date,
    total_value: 0,
    total_cost_basis: 0,
    unrealized_gain: 0,
    net_cash_injected: 0,
    cash_delta: null,
    tri: null,
    tri_rolling_1y: tri1y,
    tri_rolling_3y: tri3y,
  }
}
