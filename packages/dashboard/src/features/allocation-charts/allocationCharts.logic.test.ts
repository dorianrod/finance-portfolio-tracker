import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { groupTail, computeMatchingIsins, computeTableRows, aggregateFilteredPoints, computePopoverPos, allocationTrendDomain } from './allocationCharts.logic'
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

describe('allocationTrendDomain', () => {
  const points = [
    { date: '2026-01-31', categories: [] },
    { date: '2026-10-13', categories: [] },
  ]

  it('starts the time axis at the selected period even when allocation history starts later', () => {
    expect(allocationTrendDomain(points, '2025-10-13')).toEqual([
      Date.parse('2025-10-13T00:00:00Z'),
      Date.parse('2026-10-13T00:00:00Z'),
    ])
  })

  it('uses the selected end date instead of the last allocation snapshot', () => {
    expect(allocationTrendDomain(points, '2026-03-01', '2026-12-31')).toEqual([
      Date.parse('2026-03-01T00:00:00Z'),
      Date.parse('2026-12-31T00:00:00Z'),
    ])
  })

  it('falls back to the available allocation history without a period filter', () => {
    expect(allocationTrendDomain(points)).toEqual([
      Date.parse('2026-01-31T00:00:00Z'),
      Date.parse('2026-10-13T00:00:00Z'),
    ])
  })
})

describe('computeMatchingIsins', () => {
  it('returns isins whose latest snapshot has a positive value for the filtered category', () => {
    const data = rawData({
      geo: [
        { snapshot_date: '2024-01-01', isin: 'A', name: 'A', values: { france: 100 } },
        { snapshot_date: '2024-02-01', isin: 'A', name: 'A', values: { france: 0, europe: 50 } },
        { snapshot_date: '2024-02-01', isin: 'B', name: 'B', values: { france: 30 } },
        { snapshot_date: '2024-01-01', isin: 'OLD', name: 'Closed position', values: { france: 500 } },
      ],
    })
    expect(computeMatchingIsins(data, { type: 'geo', value: 'france' })).toEqual(new Set(['B']))
  })

  it('returns an empty set when there is no active filter', () => {
    expect(computeMatchingIsins(rawData(), null)).toEqual(new Set())
  })
})

describe('computeTableRows', () => {
  it('uses only the global latest snapshot and combines duplicate isin rows', () => {
    const data = rawData({
      geo: [
        { snapshot_date: '2024-01-01', isin: 'OLD', name: 'Closed asset', values: { france: 500 } },
        { snapshot_date: '2024-02-01', isin: 'A', name: 'Asset A', values: { france: 100, europe: 50 } },
        { snapshot_date: '2024-02-01', isin: 'B', name: 'Asset B', values: { france: 20 } },
        { snapshot_date: '2024-02-01', isin: 'B', name: 'Asset B', values: { france: 5, europe: 5 } },
      ],
    })
    const matching = new Set(['OLD', 'A', 'B'])
    const rows = computeTableRows(data, matching, { type: 'geo', value: 'france' })
    expect(rows).toEqual([
      { isin: 'A', name: 'Asset A', totalValue: 150, filteredValue: 100 },
      { isin: 'B', name: 'Asset B', totalValue: 30, filteredValue: 25 },
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
