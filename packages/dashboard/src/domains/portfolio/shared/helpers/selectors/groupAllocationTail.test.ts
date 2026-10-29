import { describe, expect, it } from 'vitest'

import { groupAllocationTail as groupTail } from '@/domains/portfolio/shared/helpers/selectors/groupAllocationTail'

describe('groupTail', () => {
  it('returns all categories with no grouping when there are 3 or fewer', () => {
    const cats = [
      { name: 'a', value: 10 },
      { name: 'b', value: 5 },
    ]
    expect(groupTail(cats)).toEqual({ main: cats, grouped: [] })
  })

  it('groups the long tail once cumulative value crosses the 85% threshold', () => {
    const cats = [
      { name: 'big', value: 80 },
      { name: 'b', value: 10 },
      { name: 'c', value: 4 },
      { name: 'd', value: 3 },
      { name: 'e', value: 3 },
    ]
    const { main, grouped } = groupTail(cats)
    expect(main.map((c) => c.name)).toEqual(['big', 'b'])
    expect(grouped.map((c) => c.name)).toEqual(['c', 'd', 'e'])
  })

  it('folds a single-item tail back into main instead of grouping it alone', () => {
    const cats = [
      { name: 'a', value: 30 },
      { name: 'b', value: 25 },
      { name: 'c', value: 20 },
      { name: 'd', value: 14 },
      { name: 'e', value: 11 },
    ]
    const { main, grouped } = groupTail(cats)
    expect(grouped).toEqual([])
    expect(main.map((c) => c.name)).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('keeps Not concerned and nc visible instead of folding them into others', () => {
    const cats = [
      { name: 'a', value: 85 },
      { name: 'b', value: 5 },
      { name: 'c', value: 4 },
      { name: 'Not concerned', value: 3 },
      { name: 'nc', value: 2 },
      { name: 'd', value: 1 },
    ]
    const { main, grouped } = groupTail(cats)
    expect(main.map((c) => c.name)).toContain('Not concerned')
    expect(main.map((c) => c.name)).toContain('nc')
    expect(grouped.map((c) => c.name)).not.toContain('Not concerned')
    expect(grouped.map((c) => c.name)).not.toContain('nc')
  })
})
