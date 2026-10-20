import { describe, expect, it } from 'vitest'
import type { RawOperation, RawPosition } from '@/types/domain'
import {
  buildGrossValueHistory,
  buildOverviewComparison,
  resolveOverviewWindows,
} from './overviewComparison.logic'

function position(overrides: Partial<RawPosition> = {}): RawPosition {
  return {
    snapshot_date: '2025-01-31',
    account: 'A',
    account_type: 'Brokerage',
    account_category: 'brokerage',
    isin: 'ASSET-A',
    ticker: 'AAA',
    name: 'Asset A',
    quantity: '1',
    avg_buy_price: '100',
    last_price: '100',
    total_value: '100',
    unrealized_gain: '10',
    unrealized_gain_net: '7',
    unrealized_gain_pct: '10',
    realized_gain: '0',
    realized_gain_net: '0',
    total_dividends: '0',
    total_dividends_net: '0',
    total_interest: '0',
    total_interest_net: '0',
    tax_rate: '0.3',
    xirr: '',
    xirr_rolling_3y: '',
    xirr_rolling_period_years: '',
    total_return_pct: '',
    ...overrides,
  }
}

function operation(overrides: Partial<RawOperation> = {}): RawOperation {
  return {
    date: '2025-01-15',
    account: 'A',
    isin: 'ASSET-A',
    ticker: 'AAA',
    name: 'Asset A',
    operation_type: 'DIVIDEND',
    quantity: '',
    price_per_unit: '',
    total_amount: '10',
    currency: 'EUR',
    realized_gain: '',
    ...overrides,
  }
}

describe('resolveOverviewWindows', () => {
  const dates = ['2024-01-31', '2026-10-20']

  it('defaults to a trailing year and an immediately preceding equal window', () => {
    expect(resolveOverviewWindows(dates)).toEqual({
      current: { start: '2025-10-21', end: '2026-10-20' },
      previous: { start: '2024-10-21', end: '2025-10-20' },
      defaultedToTrailingYear: true,
    })
  })

  it('keeps custom month boundaries equal and non-overlapping', () => {
    expect(resolveOverviewWindows(dates, '2026-01-01', '2026-01-31')).toEqual({
      current: { start: '2026-01-01', end: '2026-01-31' },
      previous: { start: '2025-12-01', end: '2025-12-31' },
      defaultedToTrailingYear: false,
    })
  })

  it('uses the latest observation for a start-only period', () => {
    expect(resolveOverviewWindows(dates, '2026-10-01')?.current).toEqual({
      start: '2026-10-01',
      end: '2026-10-20',
    })
  })

  it('uses available history for an end-only period and rejects reversed ranges', () => {
    expect(resolveOverviewWindows(dates, undefined, '2026-01-31')?.current).toEqual({
      start: '2024-01-31',
      end: '2026-01-31',
    })
    expect(resolveOverviewWindows(dates, '2026-05-01', '2026-01-31')).toBeNull()
  })
})

describe('buildGrossValueHistory', () => {
  it('computes historical gross value and respects account filters', () => {
    const rows = [
      position({ account: 'A', total_value: '100', unrealized_gain: '20', unrealized_gain_net: '14' }),
      position({ account: 'B', total_value: '300', unrealized_gain: '50', unrealized_gain_net: '35' }),
    ]

    expect(buildGrossValueHistory(rows, new Set(['A']))).toEqual([
      { date: '2025-01-31', value: 100 },
    ])
  })

  it('does not adjust the market value for unrealized tax fields', () => {
    expect(buildGrossValueHistory([
      position({ total_value: '100', unrealized_gain: '20', unrealized_gain_net: '14' }),
    ])[0].value).toBe(100)
  })
})

describe('buildOverviewComparison', () => {
  it('compares point-in-time values and period flows for the selected account', () => {
    const comparison = buildOverviewComparison({
      rawPositions: [
        position({ snapshot_date: '2025-01-31', isin: 'A1', name: 'A1', total_value: '70', unrealized_gain: '0', unrealized_gain_net: '0' }),
        position({ snapshot_date: '2025-01-31', isin: 'A2', name: 'A2', total_value: '30', unrealized_gain: '0', unrealized_gain_net: '0' }),
        position({ snapshot_date: '2025-02-28', isin: 'A1', name: 'A1', total_value: '70', unrealized_gain: '0', unrealized_gain_net: '0' }),
        position({ snapshot_date: '2025-02-28', isin: 'A2', name: 'A2', total_value: '70', unrealized_gain: '0', unrealized_gain_net: '0' }),
        position({ snapshot_date: '2025-02-28', account: 'B', isin: 'B1', total_value: '1000', unrealized_gain: '0', unrealized_gain_net: '0' }),
      ],
      rawOperations: [
        operation({ date: '2025-01-15', total_amount: '10' }),
        operation({ date: '2025-02-15', operation_type: 'INTEREST', total_amount: '25' }),
        operation({ date: '2025-02-15', account: 'B', total_amount: '999' }),
      ],
      savingCapacity: [
        { date: '2025-01-31', savings_delta: 100, perf_delta: 20 },
        { date: '2025-02-28', savings_delta: 150, perf_delta: -10 },
      ],
      fundHoldingsHistory: [],
      accountFilters: new Set(['A']),
      dateFrom: '2025-02-01',
      dateTo: '2025-02-28',
    })

    expect(comparison).not.toBeNull()
    expect(comparison?.value).toMatchObject({ current: 140, previous: 100, delta: 40, deltaPct: 40 })
    expect(comparison?.contributions).toMatchObject({ current: 150, previous: 100, delta: 50, deltaPct: 50 })
    expect(comparison?.marketPerformance).toMatchObject({ current: -10, previous: 20, delta: -30, deltaPct: -150 })
    expect(comparison?.passiveIncome).toMatchObject({ current: 25, previous: 10, delta: 15, deltaPct: 150 })
    expect(comparison?.heldConcentration.topHolding).toMatchObject({ current: 50, previous: 70, delta: -20 })
    expect(comparison?.lookThroughConcentration.current).toBeNull()
  })

  it('does not invent a relative percentage when the previous value is zero', () => {
    const comparison = buildOverviewComparison({
      rawPositions: [
        position({ snapshot_date: '2025-01-31', total_value: '0', unrealized_gain: '0', unrealized_gain_net: '0' }),
        position({ snapshot_date: '2025-02-28', total_value: '100', unrealized_gain: '0', unrealized_gain_net: '0' }),
      ],
      rawOperations: [],
      savingCapacity: [
        { date: '2025-01-31', savings_delta: 0, perf_delta: 0 },
        { date: '2025-02-28', savings_delta: 100, perf_delta: 0 },
      ],
      fundHoldingsHistory: [],
      dateFrom: '2025-02-01',
      dateTo: '2025-02-28',
    })

    expect(comparison?.value.deltaPct).toBeNull()
    expect(comparison?.contributions.deltaPct).toBeNull()
  })
})
