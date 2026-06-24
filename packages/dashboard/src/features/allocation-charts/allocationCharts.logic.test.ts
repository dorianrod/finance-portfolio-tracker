import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { groupTail, computeMatchingIsins, computeTableRows, aggregateFilteredPoints, computePopoverPos } from './allocationCharts.logic'
import type { RawIsinData, RawIsinRow } from '@/hooks/useRawIsinData'

function rawData(overrides: Partial<RawIsinData> = {}): RawIsinData {
  return { geo: [], secteur: [], currency: [], classe: [], loading: false, ...overrides }
}

describe('groupTail', () => {
  it('returns all categories with no grouping when there are 3 or fewer', () => {
    const cats = [{ name: 'a', value: 10 }, { name: 'b', value: 5 }]
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
})

describe('computeMatchingIsins', () => {
  it('returns isins whose latest snapshot has a positive value for the filtered category', () => {
    const data = rawData({
      geo: [
        { snapshot_date: '2024-01-01', isin: 'A', name: 'A', values: { france: 100 } },
        { snapshot_date: '2024-02-01', isin: 'A', name: 'A', values: { france: 0, europe: 50 } },
        { snapshot_date: '2024-02-01', isin: 'B', name: 'B', values: { france: 30 } },
      ],
    })
    expect(computeMatchingIsins(data, { type: 'geo', value: 'france' })).toEqual(new Set(['B']))
  })

  it('returns an empty set when there is no active filter', () => {
    expect(computeMatchingIsins(rawData(), null)).toEqual(new Set())
  })
})

describe('computeTableRows', () => {
  it('pairs each matching isin\'s total value with its filtered-category value, sorted desc', () => {
    const data = rawData({
      geo: [
        { snapshot_date: '2024-01-01', isin: 'A', name: 'Asset A', values: { france: 100, europe: 50 } },
        { snapshot_date: '2024-01-01', isin: 'B', name: 'Asset B', values: { france: 20 } },
      ],
    })
    const matching = new Set(['A', 'B'])
    const rows = computeTableRows(data, matching, { type: 'geo', value: 'france' })
    expect(rows).toEqual([
      { isin: 'A', name: 'Asset A', totalValue: 150, filteredValue: 100 },
      { isin: 'B', name: 'Asset B', totalValue: 20, filteredValue: 20 },
    ])
  })
})

describe('aggregateFilteredPoints', () => {
  it('sums category values across matching isins by date, sorted with nc last', () => {
    const rows: RawIsinRow[] = [
      { snapshot_date: '2024-01-01', isin: 'A', name: 'A', values: { france: 10, nc: 2 } },
      { snapshot_date: '2024-01-01', isin: 'B', name: 'B', values: { france: 5, europe: 20 } },
      { snapshot_date: '2024-01-01', isin: 'C', name: 'C', values: { france: 999 } }, // not in matchingIsins
    ]
    const result = aggregateFilteredPoints(rows, new Set(['A', 'B']))
    expect(result).toEqual([
      { date: '2024-01-01', categories: [{ name: 'europe', value: 20 }, { name: 'france', value: 15 }, { name: 'nc', value: 2 }] },
    ])
  })

  it('restricts to a single category when restrictToCategory is provided', () => {
    const rows: RawIsinRow[] = [{ snapshot_date: '2024-01-01', isin: 'A', name: 'A', values: { france: 10, europe: 20 } }]
    const result = aggregateFilteredPoints(rows, new Set(['A']), 'france')
    expect(result).toEqual([{ date: '2024-01-01', categories: [{ name: 'france', value: 10 }] }])
  })
})

describe('computePopoverPos', () => {
  const rect = { left: 1000, right: 1050, top: 100, height: 20 } as DOMRect

  beforeEach(() => {
    // @ts-expect-error minimal window stub for layout math only
    globalThis.window = { innerWidth: 1200, innerHeight: 800 }
  })
  afterEach(() => {
    // @ts-expect-error cleanup
    delete globalThis.window
  })

  it('places the popover to the right of the anchor when there is room', () => {
    // top = rect.top + rect.height/2 - h/2 = 100 + 10 - 25
    expect(computePopoverPos(rect, 100, 50)).toEqual({ top: 85, left: 1060 })
  })

  it('flips to the left of the anchor when it would overflow the right edge', () => {
    const result = computePopoverPos(rect, 300, 50)
    expect(result.left).toBe(1000 - 300 - 10)
  })

  it('clamps to the viewport bottom when it would overflow', () => {
    const tallRect = { left: 0, right: 50, top: 750, height: 20 } as DOMRect
    const result = computePopoverPos(tallRect, 100, 200)
    expect(result.top).toBe(800 - 200 - 10)
  })
})
