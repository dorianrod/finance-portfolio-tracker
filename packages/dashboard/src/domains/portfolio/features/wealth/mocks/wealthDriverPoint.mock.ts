import type { WealthDriverPoint } from '@/domains/portfolio/features/wealth/types/wealthDriverPoint.type'

export function makeWealthDriverPoint(
  overrides: Partial<WealthDriverPoint> = {},
): WealthDriverPoint {
  return {
    date: new Date('2026-09-30T00:00:00Z'),
    savings_delta: 100,
    perf_delta: 20,
    cumulative_savings: 100,
    cumulative_performance: 20,
    cumulative_change: 120,
    ...overrides,
  }
}
