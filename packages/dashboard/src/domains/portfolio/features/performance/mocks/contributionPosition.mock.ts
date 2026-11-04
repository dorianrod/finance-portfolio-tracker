import { pos as baseFixture } from '@/domains/portfolio/shared/mocks/rawPosition.mock'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'

export function position(overrides: Partial<RawPosition>): RawPosition {
  return baseFixture({
    snapshot_date: new Date('2021-01-31'),
    account_type: 'Bourse',
    ticker: 'AAA',
    name: 'Asset A',
    last_price: 101,
    total_value: 1010,
    unrealized_gain: 10,
    unrealized_gain_pct: 1,
    total_dividends: 0,
    total_dividends_net: 0,
    unrealized_gain_net: 7,
    xirr: 1,
    xirr_rolling_3y: 0,
    xirr_rolling_period_years: 0,
    total_return_pct: 1,
    ...overrides,
  })
}
