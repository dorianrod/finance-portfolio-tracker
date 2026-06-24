import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  computeMonthlyBalances, computeRollingReturns, computeUnitPriceDomain, computePosition, buildHoverChartSeries,
  type HoverChartDataPoint,
} from './hoverCharts.logic'
import type { HistoryPoint } from '@/hooks/usePositionsHistory'

describe('computeMonthlyBalances', () => {
  it('accumulates a running balance per month from dated deltas', () => {
    const ops = [
      { date: '2024-01-15', total_amount: 100 },
      { date: '2024-01-20', total_amount: 50 },
      { date: '2024-02-05', total_amount: -30 },
    ]
    expect(computeMonthlyBalances(ops)).toEqual([
      { month: '2024-01', balance: 150, delta: 150 },
      { month: '2024-02', balance: 120, delta: -30 },
    ])
  })
})

describe('computeRollingReturns', () => {
  const series = Array.from({ length: 13 }, (_, i) => ({
    date: `m${i}`,
    'Unit price': 100 + i * 10, // m0=100 ... m12=220
  }))

  it('computes 6m, 1y and since-start returns relative to the hovered point', () => {
    const rows = computeRollingReturns(series, 'm12')
    expect(rows).toEqual([
      { label: '6m', pct: (220 / 160 - 1) * 100 },
      { label: '1y', pct: (220 / 100 - 1) * 100 },
      { label: 'Since start', pct: (220 / 100 - 1) * 100 },
    ])
  })

  it('returns an empty list when the label is not found in the series', () => {
    expect(computeRollingReturns(series, 'unknown')).toEqual([])
  })
})

describe('computeUnitPriceDomain', () => {
  function point(unitPrice: number): HoverChartDataPoint {
    return { date: 'd', Value: 0, 'Cost basis': 0, 'Unit price': unitPrice, hasBuy: false, hasSell: false }
  }

  it('pads the [min, max] of positive unit prices by 15%', () => {
    const domain = computeUnitPriceDomain([point(100), point(120)])
    const padding = (120 - 100) * 0.15
    expect(domain).toEqual([100 - padding, 120 + padding])
  })

  it('returns undefined when there are no positive unit prices', () => {
    expect(computeUnitPriceDomain([point(0)])).toBeUndefined()
  })
})

describe('buildHoverChartSeries', () => {
  it('attaches each month\'s buy/sell activity to its position snapshot', () => {
    const history: HistoryPoint[] = [
      { date: '2024-01-15', value: 1000, costBasis: 900, pct: 11, last_price: 100 },
      { date: '2024-02-10', value: 1100, costBasis: 900, pct: 22, last_price: 110 },
    ]
    const operations = [
      { date: '2024-01-05', operation_type: 'BUY', total_amount: -900, realized_gain: null },
      { date: '2024-02-20', operation_type: 'SELL', total_amount: 500, realized_gain: 50 },
    ]
    const series = buildHoverChartSeries(history, operations)
    expect(series).toEqual([
      {
        date: '2024-01', Value: 1000, 'Cost basis': 900, 'Unit price': 100,
        hasBuy: true, hasSell: false, buyAmount: 900, sellAmount: undefined, sellGain: undefined,
      },
      {
        date: '2024-02', Value: 1100, 'Cost basis': 900, 'Unit price': 110,
        hasBuy: false, hasSell: true, buyAmount: undefined, sellAmount: 500, sellGain: 50,
      },
    ])
  })

  it('returns no buy/sell flags when there is no matching activity that month', () => {
    const history: HistoryPoint[] = [{ date: '2024-01-15', value: 1000, costBasis: 900, pct: null, last_price: 100 }]
    const series = buildHoverChartSeries(history, [])
    expect(series[0].hasBuy).toBe(false)
    expect(series[0].hasSell).toBe(false)
  })
})

describe('computePosition', () => {
  beforeEach(() => {
    // @ts-expect-error minimal window stub for layout math only
    globalThis.window = { innerWidth: 1200, innerHeight: 800 }
  })
  afterEach(() => {
    // @ts-expect-error cleanup
    delete globalThis.window
  })

  it('places the popover to the right of the anchor, clamped to the top margin when centering would go off-screen', () => {
    const rect = { left: 100, right: 150, top: 200, height: 20 } as DOMRect
    // W=600, H=460 are fixed; naive top = rect.top + height/2 - H/2 = 200 + 10 - 230 = -20, clamped to the 10px margin
    expect(computePosition(rect)).toEqual({ top: 10, left: 160 })
  })

  it('flips to the left of the anchor when it would overflow the right edge', () => {
    const rect = { left: 1000, right: 1050, top: 200, height: 20 } as DOMRect
    const result = computePosition(rect)
    expect(result.left).toBe(1000 - 600 - 10)
  })
})
