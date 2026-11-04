import { describe, expect, it } from 'vitest'

import { buildCumulativeWealthDrivers } from '@/domains/portfolio/features/wealth/helpers/transformers/wealthCalculations/buildCumulativeWealthDrivers'
import { makeSavingCapacityPoint as fixtureSavingCapacityPoint } from '@/domains/portfolio/shared/mocks/savingCapacityPoint.mock'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

describe('buildCumulativeWealthDrivers', () => {
  const points: SavingCapacityPoint[] = [
    fixtureSavingCapacityPoint({
      date: new Date('2024-01-31'),
      perf_delta: 10,
    }),
    fixtureSavingCapacityPoint({
      date: new Date('2024-02-29'),
      savings_delta: 50,
      perf_delta: -20,
    }),
    fixtureSavingCapacityPoint({
      date: new Date('2024-03-31'),
      savings_delta: -25,
      perf_delta: 30,
    }),
  ]
  it('builds cumulative savings, performance and total change', () => {
    expect(buildCumulativeWealthDrivers(points).at(-1)).toMatchObject({
      cumulative_savings: 125,
      cumulative_performance: 20,
      cumulative_change: 145,
    })
  })
})
