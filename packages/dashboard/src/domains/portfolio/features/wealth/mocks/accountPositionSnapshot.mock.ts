import type { RawPositionRow } from '@/domains/portfolio/shared/types/rawPosition.type'

export function makeAccountPositionSnapshot(
  overrides: Partial<RawPositionRow>,
): RawPositionRow {
  return {
    snapshot_date: new Date('2024-01-01'),
    account: 'acc1',
    account_type: 'PEA',
    account_category: 'brokerage',
    quantity: 1,
    avg_buy_price: 100,
    total_value: 1000,
    unrealized_gain: 0,
    ...overrides,
  }
}
