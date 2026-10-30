import { describe, expect, it } from 'vitest'

import { makeAllocationPoint as fixtureAllocationPoint } from '@/domains/portfolio/shared/mocks/allocationPoint.mock'

import { buildAllocationPieData } from './buildAllocationPieData'

describe('allocation pie presentation', () => {
  it('conserves allocation value and keeps inapplicable exposure out of the grouped tail', () => {
    const categories = [
      { name: 'Equity', value: 90 },
      { name: 'Bonds', value: 4 },
      { name: 'nc', value: 2 },
      { name: 'Other A', value: 2 },
      { name: 'Other B', value: 2 },
    ]
    const result = buildAllocationPieData(
      fixtureAllocationPoint({ date: new Date('2026-01-31'), categories }),
    )
    expect(result.total).toBe(100)
    expect(result.data.map((entry) => entry.name)).toEqual(['Equity', 'nc', ''])
    expect(result.data.reduce((sum, entry) => sum + entry.value, 0)).toBe(100)
    expect(result.data[2].subItems).toEqual([
      categories[1],
      categories[3],
      categories[4],
    ])
    expect(result.data.every((entry) => entry.total === 100)).toBe(true)
    expect(categories).toHaveLength(5)
  })

  it('keeps an empty allocation empty', () => {
    expect(
      buildAllocationPieData({ date: new Date('2026-01-31'), categories: [] }),
    ).toEqual({ total: 0, data: [] })
  })
})
