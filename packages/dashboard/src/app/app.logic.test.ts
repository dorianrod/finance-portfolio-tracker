import { describe, it, expect } from 'vitest'
import { applyPositionFilters, applyAccountFilterToHistory, buildAccountTypeBreakdown, sortPositionsForTable, getSortValue } from './app.logic'
import type { PositionRow, GroupRow, OperationRow } from '@/types/domain'
import type { Filters } from '@/types/filters'
import type { PortfolioHistoryPoint } from '@/types/history'
import type { RawPositionRow } from '@/hooks/useAllPositions'

function baseFilters(overrides: Partial<Filters> = {}): Filters {
  return {
    accountTypes: new Set(),
    accounts: new Set(),
    operationTypes: new Set(),
    hideClosedPositions: false,
    ...overrides,
  }
}

function op(overrides: Partial<OperationRow>): OperationRow {
  return {
    kind: 'operation',
    id: 'op1',
    date: '2024-01-01',
    account: 'acc1',
    operation_type: 'BUY',
    quantity: 1,
    price_per_unit: 100,
    total_amount: -100,
    realized_gain: null,
    ...overrides,
  }
}

function group(overrides: Partial<GroupRow>): GroupRow {
  return {
    kind: 'group',
    id: 'g1',
    label: 'Buys / Sells',
    subRows: [],
    ...overrides,
  }
}

function position(overrides: Partial<PositionRow>): PositionRow {
  return {
    kind: 'position',
    id: 'p1',
    name: 'Asset',
    ticker: '',
    isin: '',
    account: 'acc1',
    status: 'active',
    operationTypes: new Set(['BUY', 'SELL']),
    total_value: 1000,
    unrealized_gain: 100,
    unrealized_gain_net: 70,
    unrealized_gain_pct: 10,
    realized_gain: 50,
    realized_gain_net: 35,
    tax_rate: 0.3,
    total_dividends: 20,
    total_dividends_net: 14,
    total_interest: 0,
    total_interest_net: 0,
    total_realized_return: 70,
    total_invested: 1000,
    total_return_pct: 12,
    xirr: 8,
    subRows: [],
    ...overrides,
  }
}

describe('applyPositionFilters', () => {
  it('filters by account when no date range is set, leaving snapshot values untouched', () => {
    const positions = [position({ id: 'a', account: 'acc1' }), position({ id: 'b', account: 'acc2' })]
    const result = applyPositionFilters(positions, baseFilters({ accounts: new Set(['acc1']) }))
    expect(result.map((p) => p.id)).toEqual(['a'])
    expect(result[0].total_value).toBe(1000)
  })

  it('recomputes realized gain and dividends from only the operations within the date range', () => {
    const buySellGroup = group({
      label: 'Buys / Sells',
      subRows: [
        op({ id: 'sell-in', date: '2024-03-01', operation_type: 'SELL', total_amount: 500, realized_gain: 80 }),
        op({ id: 'sell-out', date: '2024-09-01', operation_type: 'SELL', total_amount: 300, realized_gain: 40 }),
      ],
    })
    const dividendGroup = group({
      label: 'Dividends',
      total_dividends: 999, // stale snapshot value; must be recomputed from ops
      dividend_count: 999,
      subRows: [
        op({ id: 'div-in', date: '2024-02-01', operation_type: 'DIVIDEND', total_amount: 15, realized_gain: null }),
        op({ id: 'div-out', date: '2024-12-01', operation_type: 'DIVIDEND', total_amount: 25, realized_gain: null }),
      ],
    })
    const positions = [position({ subRows: [buySellGroup, dividendGroup], realized_gain: 999, total_dividends: 999 })]

    const result = applyPositionFilters(positions, baseFilters({ dateFrom: '2024-01-01', dateTo: '2024-06-01' }))

    expect(result).toHaveLength(1)
    expect(result[0].realized_gain).toBe(80) // only sell-in falls in range
    expect(result[0].total_dividends).toBe(15) // only div-in falls in range
    expect(result[0].total_realized_return).toBe(95)
    // total_value/unrealized_gain are point-in-time snapshots, unaffected by the date filter
    expect(result[0].total_value).toBe(1000)
  })

  it('drops a position entirely if none of its operations fall within the date range', () => {
    const positions = [position({ subRows: [group({ label: 'Buys / Sells', subRows: [op({ date: '2023-01-01' })] })] })]
    const result = applyPositionFilters(positions, baseFilters({ dateFrom: '2024-01-01' }))
    expect(result).toEqual([])
  })
})

describe('applyAccountFilterToHistory', () => {
  const enrichedHistory: PortfolioHistoryPoint[] = [
    { date: '2024-01-01', total_value: 999, total_cost_basis: 999, unrealized_gain: 999, net_cash_injected: 0, cash_delta: null, tri: 1.5, total_broker_cash: 50 },
  ]

  function rawRow(overrides: Partial<RawPositionRow>): RawPositionRow {
    return {
      snapshot_date: '2024-01-01',
      account: 'acc1',
      account_type: 'PEA',
      account_category: 'brokerage',
      quantity: '10',
      avg_buy_price: '50',
      total_value: '600',
      unrealized_gain: '100',
      ...overrides,
    }
  }

  it('returns the precomputed history unchanged when no account filter is set', () => {
    expect(applyAccountFilterToHistory([], enrichedHistory, new Set())).toBe(enrichedHistory)
  })

  it('rebuilds the history from raw per-account snapshots restricted to the selected accounts', () => {
    const rows = [
      rawRow({ account: 'acc1', total_value: '600', quantity: '10', avg_buy_price: '50', unrealized_gain: '100' }),
      rawRow({ account: 'acc2', total_value: '9999', quantity: '1', avg_buy_price: '1', unrealized_gain: '9999' }),
    ]
    const result = applyAccountFilterToHistory(rows, enrichedHistory, new Set(['acc1']))
    expect(result).toEqual([{
      date: '2024-01-01',
      total_value: 600,
      total_cost_basis: 500, // quantity * avg_buy_price
      unrealized_gain: 100,
      net_cash_injected: 0,
      cash_delta: null,
      tri: null,
      total_broker_cash: 0,
    }])
  })

  it('sums multiple accounts on the same date', () => {
    const rows = [
      rawRow({ account: 'acc1', total_value: '600', quantity: '10', avg_buy_price: '50', unrealized_gain: '100' }),
      rawRow({ account: 'acc2', total_value: '300', quantity: '5', avg_buy_price: '50', unrealized_gain: '50' }),
    ]
    const result = applyAccountFilterToHistory(rows, enrichedHistory, new Set(['acc1', 'acc2']))
    expect(result[0].total_value).toBe(900)
    expect(result[0].total_cost_basis).toBe(750)
    expect(result[0].unrealized_gain).toBe(150)
  })
})

describe('buildAccountTypeBreakdown', () => {
  it('aggregates active positions cost basis and gain by account type, sorted by total value desc', () => {
    const positions = [
      position({ account_type: 'PEA', total_value: 1000, unrealized_gain: 100 }),
      position({ account_type: 'PEA', total_value: 500, unrealized_gain: -50 }),
      position({ account_type: 'CTO', total_value: 2000, unrealized_gain: 200 }),
      position({ account_type: 'PEA', status: 'closed', total_value: 9999, unrealized_gain: 9999 }),
    ]
    expect(buildAccountTypeBreakdown(positions)).toEqual([
      { account_type: 'CTO', total_cost_basis: 1800, unrealized_gain: 200, total_value: 2000 },
      { account_type: 'PEA', total_cost_basis: 1450, unrealized_gain: 50, total_value: 1500 },
    ])
  })
})

describe('sortPositionsForTable', () => {
  it('sorts by descending total_value within account type groups when account types exist', () => {
    const positions = [
      position({ id: 'low', account_type: 'PEA', total_value: 100 }),
      position({ id: 'high', account_type: 'PEA', total_value: 900 }),
    ]
    const result = sortPositionsForTable(positions, false, ['PEA'], 'total_value', 'desc')
    expect(result.map((p) => p.id)).toEqual(['high', 'low'])
  })

  it('hides closed positions when requested', () => {
    const positions = [position({ id: 'open', status: 'active' }), position({ id: 'closed', status: 'closed' })]
    const result = sortPositionsForTable(positions, true, [], 'total_value', 'desc')
    expect(result.map((p) => p.id)).toEqual(['open'])
  })
})

describe('getSortValue', () => {
  it('reads total_dividends as dividends + interest combined', () => {
    expect(getSortValue(position({ total_dividends: 10, total_interest: 5 }), 'total_dividends')).toBe(15)
  })
})
