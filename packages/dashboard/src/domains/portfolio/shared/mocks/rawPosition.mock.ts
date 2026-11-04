import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'

export function pos(overrides: Partial<RawPosition>): RawPosition {
  return {
    snapshot_date: new Date('2024-06-01'),
    account: 'acc1',
    account_type: 'PEA',
    account_category: 'brokerage',
    isin: 'FR0000000001',
    ticker: '',
    name: 'Test Asset',
    quantity: 10,
    avg_buy_price: 100,
    last_price: 120,
    total_value: 1200,
    unrealized_gain: 200,
    unrealized_gain_pct: 20,
    realized_gain: 0,
    total_dividends: 50,
    total_dividends_net: 35,
    total_interest: 0,
    total_interest_net: 0,
    tax_rate: 0.3,
    unrealized_gain_net: 140,
    realized_gain_net: 0,
    xirr: 12.5,
    xirr_rolling_3y: 8.25,
    xirr_rolling_period_years: 3,
    total_return_pct: 20,
    ...overrides,
  }
}
