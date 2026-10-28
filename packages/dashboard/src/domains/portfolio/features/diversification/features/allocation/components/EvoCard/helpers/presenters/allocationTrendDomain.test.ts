import { describe, expect, it } from 'vitest'

import { allocationTrendDomain } from '@/domains/portfolio/features/diversification/features/allocation/components/EvoCard/helpers/presenters/allocationTrendDomain'

describe('allocationTrendDomain', () => {
  const points = [
    { date: new Date('2026-01-31'), categories: [] },
    { date: new Date('2026-10-13'), categories: [] },
  ]

  it('always spans the complete available allocation history', () => {
    expect(allocationTrendDomain(points)).toEqual([
      Date.parse('2026-01-31T00:00:00Z'),
      Date.parse('2026-10-13T00:00:00Z'),
    ])
  })
})
