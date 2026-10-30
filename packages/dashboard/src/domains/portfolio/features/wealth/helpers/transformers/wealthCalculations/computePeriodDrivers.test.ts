import { describe, expect, it } from 'vitest'

import { computePeriodDrivers } from '@/domains/portfolio/features/wealth/helpers/transformers/wealthCalculations/computePeriodDrivers'
import { makeSavingCapacityPoint as fixtureSavingCapacityPoint } from '@/domains/portfolio/shared/mocks/savingCapacityPoint.mock'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

describe('computePeriodDrivers', () => {
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
  it('summarises change drivers for a period', () => {
    expect(computePeriodDrivers(points)).toEqual({
      savings: 125,
      performance: 20,
      change: 145,
    })
  })
})
