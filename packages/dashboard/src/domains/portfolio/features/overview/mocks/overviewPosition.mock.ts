import { pos as baseFixture } from '@/domains/portfolio/shared/mocks/rawPosition.mock'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'

export function position(overrides: Partial<RawPosition> = {}): RawPosition {
  return baseFixture({
    snapshot_date: new Date('2025-01-31'),
    account: 'A',
    account_type: 'Brokerage',
    isin: 'ASSET-A',
    ticker: 'AAA',
    name: 'Asset A',
    quantity: 1,
    last_price: 100,
    total_value: 100,
    unrealized_gain: 10,
    unrealized_gain_net: 7,
    unrealized_gain_pct: 10,
    total_dividends: 0,
    total_dividends_net: 0,
    xirr: 0,
    xirr_rolling_3y: 0,
    xirr_rolling_period_years: 0,
    total_return_pct: 0,
    ...overrides,
  })
}
