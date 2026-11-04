import type { RawPositionRow } from '@/domains/portfolio/shared/types/rawPosition.type'

export function rawRow(overrides: Partial<RawPositionRow>): RawPositionRow {
  return {
    snapshot_date: new Date('2024-01-01'),
    account: 'acc1',
    account_type: 'PEA',
    account_category: 'brokerage',
    quantity: 10,
    avg_buy_price: 50,
    total_value: 600,
    unrealized_gain: 100,
    ...overrides,
  }
}
