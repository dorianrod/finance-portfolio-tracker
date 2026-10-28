import { describe, expect, it } from 'vitest'

import { computeTrailing12mYearOverYear } from '@/domains/portfolio/features/wealth/helpers/calculators/wealthCalculations/computeTrailing12mYearOverYear'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

describe('computeTrailing12mYearOverYear', () => {
  it('compares the trailing twelve months with the preceding twelve-month window', () => {
    const points: SavingCapacityPoint[] = Array.from(
      { length: 24 },
      (_, index) => ({
        date: new Date(Date.UTC(2024, 10 + index, 28)),
        savings_delta: index < 12 ? 100 : 150,
        perf_delta: index < 12 ? 50 : -25,
      }),
    )
    const result = computeTrailing12mYearOverYear(points)

    expect(result).toEqual({
      currentMonths: [
        '2025-11',
        '2025-12',
        '2026-01',
        '2026-02',
        '2026-03',
        '2026-04',
        '2026-05',
        '2026-06',
        '2026-07',
        '2026-08',
        '2026-09',
        '2026-10',
      ],
      comparisonMonths: [
        '2024-11',
        '2024-12',
        '2025-01',
        '2025-02',
        '2025-03',
        '2025-04',
        '2025-05',
        '2025-06',
        '2025-07',
        '2025-08',
        '2025-09',
        '2025-10',
      ],
      savings: { current: 1800, previous: 1200, changePct: 50 },
      performance: { current: -300, previous: 600, changePct: -150 },
    })
  })
})

describe('computeTrailing12mYearOverYear', () => {
  it('does not report an incomplete trailing twelve-month window', () => {
    const result = computeTrailing12mYearOverYear([
      { date: new Date('2025-10-31'), savings_delta: 1000, perf_delta: 100 },
      { date: new Date('2026-10-11'), savings_delta: 2000, perf_delta: 200 },
    ])

    expect(result.savings).toEqual({
      current: null,
      previous: null,
      changePct: null,
    })
    expect(result.performance).toEqual({
      current: null,
      previous: null,
      changePct: null,
    })
  })
})

describe('computeTrailing12mYearOverYear', () => {
  it('anchors the trailing comparison at the selected end date', () => {
    const points: SavingCapacityPoint[] = Array.from(
      { length: 36 },
      (_, index) => ({
        date: new Date(Date.UTC(2023, index, 28)),
        savings_delta: index < 24 ? 100 : 999,
        perf_delta: index < 24 ? 10 : 999,
      }),
    )
    const result = computeTrailing12mYearOverYear(
      points,
      new Date('2024-12-31'),
    )
    expect(result.currentMonths.at(-1)).toBe('2024-12')
    expect(result.savings.current).toBe(1200)
    expect(result.savings.previous).toBe(1200)
  })
})
