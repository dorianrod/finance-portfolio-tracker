import { describe, expect, it } from 'vitest'

import { filterPointsByPeriod } from '@/domains/portfolio/shared/helpers/transformers/filterPointsByPeriod'
import { makeSavingCapacityPoint as fixtureSavingCapacityPoint } from '@/domains/portfolio/shared/mocks/savingCapacityPoint.mock'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

describe('filterPointsByPeriod', () => {
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
  it('filters points inclusively by date', () => {
    expect(
      filterPointsByPeriod(
        points,
        new Date('2024-02-01'),
        new Date('2024-02-29'),
      ),
    ).toEqual([points[1]])
  })
})
