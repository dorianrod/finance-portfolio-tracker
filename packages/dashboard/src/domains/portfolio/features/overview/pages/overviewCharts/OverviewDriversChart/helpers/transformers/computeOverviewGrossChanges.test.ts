import { describe, expect, it } from 'vitest'

import { metric } from '@/domains/portfolio/features/overview/mocks/comparedMetric.mock'

import { computeOverviewGrossChanges } from './computeOverviewGrossChanges'

describe('computeOverviewGrossChanges', () => {
  it.each([
    {
      name: 'both periods',
      contributions: metric(15, 8),
      marketPerformance: metric(5, -3),
      expected: { currentChange: 20, previousChange: 5 },
    },
    {
      name: 'missing current contributions',
      contributions: metric(null, 8),
      marketPerformance: metric(5, -3),
      expected: { currentChange: null, previousChange: 5 },
    },
    {
      name: 'missing previous performance',
      contributions: metric(15, 8),
      marketPerformance: metric(-20, null),
      expected: { currentChange: -5, previousChange: null },
    },
    {
      name: 'zero movements',
      contributions: metric(0, 0),
      marketPerformance: metric(0, 0),
      expected: { currentChange: 0, previousChange: 0 },
    },
  ])(
    'preserves $name independently',
    ({ contributions, marketPerformance, expected }) => {
      expect(
        computeOverviewGrossChanges({ contributions, marketPerformance }),
      ).toEqual(expected)
    },
  )
})
