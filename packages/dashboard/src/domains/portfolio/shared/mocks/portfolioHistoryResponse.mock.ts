import type { PortfolioHistoryResponse } from '@/domains/portfolio/shared/types/portfolioHistoryResponse.type'

export function makePortfolioHistoryResponse(
  overrides: Partial<PortfolioHistoryResponse> = {},
): PortfolioHistoryResponse {
  return {
    accounts: ['broker'],
    history: [
      {
        snapshot_date: new Date('2026-01-31'),
        total_value: 100,
        total_cost_basis: 90,
        unrealized_gain: 10,
        net_cash_injected: 90,
        cash_delta: 0,
        tri: 12,
        tri_rolling_1y: null,
        tri_rolling_3y: null,
      },
    ],
    ...overrides,
  }
}
