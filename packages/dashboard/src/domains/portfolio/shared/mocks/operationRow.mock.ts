import type { OperationRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function op(overrides: Partial<OperationRow>): OperationRow {
  return {
    kind: 'operation',
    id: 'op1',
    date: new Date('2024-01-01'),
    account: 'acc1',
    operation_type: 'BUY',
    quantity: 1,
    price_per_unit: 100,
    total_amount: -100,
    realized_gain: null,
    ...overrides,
  }
}
