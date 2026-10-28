import type { RawOperation } from '@/domains/portfolio/shared/types/rawOperation.type'

export function op(overrides: Partial<RawOperation>): RawOperation {
  return {
    date: new Date('2024-01-01'),
    account: 'acc1',
    isin: 'FR0000000001',
    ticker: '',
    name: 'Test Asset',
    operation_type: 'BUY',
    quantity: 10,
    price_per_unit: 100,
    total_amount: -1000,
    currency: 'EUR',
    realized_gain: 0,
    ...overrides,
  }
}
