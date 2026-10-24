import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function makePosition(
  overrides: Partial<PositionRow> = {},
): PositionRow {
  return {
    kind: 'position',
    id: 'asset-1',
    name: 'Asset',
    ticker: 'ASSET',
    isin: 'FR0000000001',
    account: 'broker',
    account_type: 'PEA',
    account_category: 'brokerage',
    status: 'active',
    operationTypes: new Set(['BUY']),
    quantity: 10,
    last_price: 110,
    total_value: 1100,
    unrealized_gain: 100,
    unrealized_gain_net: 70,
    unrealized_gain_pct: 10,
    realized_gain: 0,
    realized_gain_net: 0,
    tax_rate: 0.3,
    total_dividends: 0,
    total_dividends_net: 0,
    total_interest: 0,
    total_interest_net: 0,
    total_realized_return: 0,
    total_invested: 1000,
    total_return_pct: 10,
    xirr: 8,
    xirr_rolling_3y: 6,
    xirr_rolling_period_years: 3,
    subRows: [],
    ...overrides,
  }
}
