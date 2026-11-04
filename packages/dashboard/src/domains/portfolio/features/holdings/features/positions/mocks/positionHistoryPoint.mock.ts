import type { HistoryPoint } from '@/domains/portfolio/features/holdings/features/positions/types/historyPoint.type'

export function makePositionHistoryPoint(
  overrides: Partial<HistoryPoint> = {},
): HistoryPoint {
  return {
    date: new Date('2024-01-15'),
    value: 1000,
    costBasis: 900,
    pct: 11,
    last_price: 100,
    ...overrides,
  }
}
