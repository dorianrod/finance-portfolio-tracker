import type { PositionChartOperation } from '@/domains/portfolio/features/holdings/features/positions/types/positionChartOperation.type'

export function makePositionChartOperation(
  overrides: Partial<PositionChartOperation> = {},
): PositionChartOperation {
  return {
    date: new Date('2024-01-05'),
    operation_type: 'BUY',
    total_amount: -900,
    realized_gain: null,
    ...overrides,
  }
}
