import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

export function makePortfolioHistoryPoint(
  overrides: Partial<PortfolioHistoryPoint> = {},
): PortfolioHistoryPoint {
  return {
    date: new Date('2026-01-31'),
    total_value: 100,
    total_cost_basis: 80,
    unrealized_gain: 20,
    net_cash_injected: 80,
    cash_delta: null,
    tri: null,
    tri_rolling_1y: null,
    tri_rolling_3y: null,
    ...overrides,
  }
}
