import { describe, expect, it } from 'vitest'

import type { HoverChartDataPoint } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData/buildHoverChartData.types'
import { buildHoverChartSeries } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData/buildHoverChartSeries'
import { computeMonthlyBalances } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData/computeMonthlyBalances'
import { computeUnitPriceDomain } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/presenters/computeUnitPriceDomain'
import type { HistoryPoint } from '@/domains/portfolio/features/holdings/features/positions/types/historyPoint.type'

describe('computeMonthlyBalances', () => {
  it('accumulates a running balance per month from dated deltas', () => {
    const ops = [
      { date: new Date('2024-01-15'), total_amount: 100 },
      { date: new Date('2024-01-20'), total_amount: 50 },
      { date: new Date('2024-02-05'), total_amount: -30 },
    ]
    expect(computeMonthlyBalances(ops)).toEqual([
      { month: '2024-01', balance: 150, delta: 150 },
      { month: '2024-02', balance: 120, delta: -30 },
    ])
  })
})

describe('computeUnitPriceDomain', () => {
  function point(unitPrice: number): HoverChartDataPoint {
    return {
      date: 'd',
      Value: 0,
      'Cost basis': 0,
      'Unit price': unitPrice,
      hasBuy: false,
      hasSell: false,
      unrealized: 0,
      rollingReturns: [],
    }
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
  it("attaches each month's buy/sell activity to its position snapshot", () => {
    const history: HistoryPoint[] = [
      {
        date: new Date('2024-01-15'),
        value: 1000,
        costBasis: 900,
        pct: 11,
        last_price: 100,
      },
      {
        date: new Date('2024-02-10'),
        value: 1100,
        costBasis: 900,
        pct: 22,
        last_price: 110,
      },
    ]
    const operations = [
      {
        date: new Date('2024-01-05'),
        operation_type: 'BUY',
        total_amount: -900,
        realized_gain: null,
      },
      {
        date: new Date('2024-02-20'),
        operation_type: 'SELL',
        total_amount: 500,
        realized_gain: 50,
      },
    ]
    const series = buildHoverChartSeries(history, operations)
    expect(series).toEqual([
      {
        date: '2024-01',
        Value: 1000,
        'Cost basis': 900,
        'Unit price': 100,
        hasBuy: true,
        hasSell: false,
        buyAmount: 900,
        sellAmount: undefined,
        sellGain: undefined,
        unrealized: 100,
        rollingReturns: [],
      },
      {
        date: '2024-02',
        Value: 1100,
        'Cost basis': 900,
        'Unit price': 110,
        hasBuy: false,
        hasSell: true,
        buyAmount: undefined,
        sellAmount: 500,
        sellGain: 50,
        unrealized: 200,
        rollingReturns: [{ period: 'since-start', pct: (110 / 100 - 1) * 100 }],
      },
    ])
  })

  it('returns no buy/sell flags when there is no matching activity that month', () => {
    const history: HistoryPoint[] = [
      {
        date: new Date('2024-01-15'),
        value: 1000,
        costBasis: 900,
        pct: null,
        last_price: 100,
      },
    ]
    const series = buildHoverChartSeries(history, [])
    expect(series[0].hasBuy).toBe(false)
    expect(series[0].hasSell).toBe(false)
  })
})
