import { describe, expect, it } from 'vitest'

import { computeTrailing12mSavings } from '@/domains/portfolio/features/wealth/helpers/transformers/wealthCalculations/computeTrailing12mSavings'
import { makeSavingCapacityPoint as fixtureSavingCapacityPoint } from '@/domains/portfolio/shared/mocks/savingCapacityPoint.mock'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

describe('computeTrailing12mSavings', () => {
  it('sums the trailing 12-month window for each of the last 12 months', () => {
    const points: SavingCapacityPoint[] = Array.from(
      { length: 24 },
      (_, i) => ({
        date: new Date(Date.UTC(2024, i, 1)),
        savings_delta: 100,
        perf_delta: 10,
      }),
    )
    const last12 = computeTrailing12mSavings(points)
    expect(last12).toHaveLength(12)
    expect(last12[0].rolling_12m).toBe(1200)
    expect(last12[0].rolling_perf_12m).toBe(120)
    expect(last12[11].rolling_12m).toBe(1200)
  })

  it('clamps the rolling window when there is less than 12 months of history', () => {
    const points: SavingCapacityPoint[] = [
      fixtureSavingCapacityPoint({ date: new Date('2024-01'), perf_delta: 5 }),
      fixtureSavingCapacityPoint({
        date: new Date('2024-02'),
        savings_delta: 200,
        perf_delta: 5,
      }),
    ]
    const last12 = computeTrailing12mSavings(points)
    expect(last12).toHaveLength(2)
    // Sums all available history rather than a strict 12-month window.
    expect(last12[1].rolling_12m).toBe(300)
  })
})
