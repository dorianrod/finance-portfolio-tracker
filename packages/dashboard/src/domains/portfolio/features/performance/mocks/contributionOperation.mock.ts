import { op as baseFixture } from '@/domains/portfolio/shared/mocks/rawOperation.mock'
import type { RawOperation } from '@/domains/portfolio/shared/types/rawOperation.type'

export function operation(overrides: Partial<RawOperation>): RawOperation {
  return baseFixture({
    date: new Date('2023-01-01'),
    ticker: 'AAA',
    name: 'Asset A',
    operation_type: 'SELL',
    quantity: 1,
    total_amount: 100,
    realized_gain: 20,
    ...overrides,
  })
}
