import { describe, expect, it } from 'vitest'

import {
  makeAllocationPoint as fixtureAllocationPoint,
  makeAllocationPoint,
} from '@/domains/portfolio/shared/mocks/allocationPoint.mock'

import { buildAllocationTrend } from './buildAllocationTrend'

describe('buildAllocationTrend identity', () => {
  it('keeps the timestamp when a source category is literally named date', () => {
    const point = makeAllocationPoint({
      categories: [{ name: 'date', value: 100 }],
    })
    expect(buildAllocationTrend([point]).rows[0].date).toBe(
      point.date.getTime(),
    )
  })
  it('keeps literal category keys separate from row metadata and JavaScript property names', () => {
    const point = makeAllocationPoint({
      categories: [
        { name: 'date', value: 20 },
        { name: 'A.with.dot', value: 20 },
        { name: '__proto__', value: 20 },
        { name: 'constructor', value: 20 },
        { name: 'values', value: 20 },
      ],
    })
    const result = buildAllocationTrend([point])
    expect(result.categories).toEqual([
      { kind: 'category', name: 'date' },
      { kind: 'category', name: 'A.with.dot' },
      { kind: 'category', name: '__proto__' },
      { kind: 'category', name: 'constructor' },
      { kind: 'category', name: 'values' },
    ])
    expect(result.rows).toEqual([
      { date: point.date.getTime(), values: [20, 20, 20, 20, 20] },
    ])
    expect(point.categories).toHaveLength(5)
  })
  it('keeps a source category distinct from a synthetic group with the same display label', () => {
    const point = makeAllocationPoint({
      categories: [
        { name: 'others (3)', value: 97 },
        { name: 'Energy', value: 1 },
        { name: 'Health', value: 1 },
        { name: 'Utilities', value: 1 },
      ],
    })
    const result = buildAllocationTrend([point])
    expect(result.categories).toEqual([
      { kind: 'category', name: 'others (3)' },
      { kind: 'group', count: 3 },
    ])
    expect(result.rows[0].values).toEqual([97, 3])
  })
  it('preserves an empty history', () => {
    expect(buildAllocationTrend([])).toEqual({ categories: [], rows: [] })
  })
})

describe('buildAllocationTrend', () => {
  it('uses one category base for the whole period and totals 100% on every populated date', () => {
    const trend = buildAllocationTrend([
      fixtureAllocationPoint({
        date: new Date('2024-01-31'),
        categories: [
          { name: 'historic only', value: 20 },
          { name: 'shared', value: 80 },
        ],
      }),
      fixtureAllocationPoint({
        date: new Date('2024-02-29'),
        categories: [
          { name: 'shared', value: 50 },
          { name: 'current only', value: 50 },
        ],
      }),
    ])

    expect(trend.categories).toEqual([
      { kind: 'category', name: 'shared' },
      { kind: 'category', name: 'current only' },
      { kind: 'category', name: 'historic only' },
    ])
    expect(trend.rows[0].values).toEqual([80, 0, 20])
    expect(trend.rows[1].values).toEqual([50, 50, 0])
    expect(
      trend.rows.map((row) =>
        row.values.reduce<number>((sum, value) => sum + (value ?? 0), 0),
      ),
    ).toEqual([100, 100])
  })

  it('uses null values to leave a visible gap when a date has no allocation data', () => {
    const trend = buildAllocationTrend([
      fixtureAllocationPoint({
        date: new Date('2024-01-31'),
        categories: [{ name: 'equity', value: 100 }],
      }),
      fixtureAllocationPoint({ date: new Date('2024-02-29'), categories: [] }),
    ])

    expect(trend.rows[1].values[0]).toBeNull()
  })
})
