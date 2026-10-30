import { makePosition as baseFixture } from '@/domains/portfolio/shared/mocks/position.mock'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function position(overrides: Partial<PositionRow>): PositionRow {
  const value = baseFixture({
    account_category: null,
    id: 'position',
    ticker: '',
    isin: '',
    account: 'account',
    operationTypes: new Set(),
    quantity: 1,
    last_price: 1,
    total_value: 0,
    unrealized_gain: 0,
    unrealized_gain_net: 0,
    unrealized_gain_pct: 0,
    tax_rate: 0,
    total_invested: 0,
    total_return_pct: 0,
    xirr: null,
    xirr_rolling_3y: null,
    xirr_rolling_period_years: null,
    ...overrides,
  })
  if (!Object.hasOwn(overrides, 'account_type')) delete value.account_type
  return value
}
