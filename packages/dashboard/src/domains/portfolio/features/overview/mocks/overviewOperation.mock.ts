import { op as baseFixture } from '@/domains/portfolio/shared/mocks/rawOperation.mock'
import type { RawOperation } from '@/domains/portfolio/shared/types/rawOperation.type'

export function operation(overrides: Partial<RawOperation> = {}): RawOperation {
  return baseFixture({
    date: new Date('2025-01-15'),
    account: 'A',
    isin: 'ASSET-A',
    ticker: 'AAA',
    name: 'Asset A',
    operation_type: 'DIVIDEND',
    quantity: 0,
    price_per_unit: 0,
    total_amount: 10,
    ...overrides,
  })
}
