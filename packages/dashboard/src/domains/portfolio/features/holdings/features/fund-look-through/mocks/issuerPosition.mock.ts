import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function makeIssuerPosition(
  overrides: Partial<PositionRow>,
): PositionRow {
  return {
    kind: 'position',
    id: 'x',
    name: 'Asset',
    ticker: '',
    isin: '',
    account: 'account',
    status: 'active',
    operationTypes: new Set(),
    quantity: 1,
    last_price: 1,
    total_value: 0,
    unrealized_gain: 0,
    unrealized_gain_net: 0,
    unrealized_gain_pct: 0,
    realized_gain: 0,
    realized_gain_net: 0,
    tax_rate: 0,
    total_dividends: 0,
    total_dividends_net: 0,
    total_interest: 0,
    total_interest_net: 0,
    total_realized_return: 0,
    total_invested: 0,
    total_return_pct: 0,
    xirr: null,
    xirr_rolling_3y: null,
    xirr_rolling_period_years: null,
    subRows: [],
    ...overrides,
  }
}
