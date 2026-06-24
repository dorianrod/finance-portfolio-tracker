import { describe, it, expect } from 'vitest'
import { computeTopPerformers, computeTrailing12mSavings, buildAccountTypeLabels, filterMonthlyOpsByAccounts } from './portfolioCharts.logic'
import type { PositionRow } from '@/types/domain'
import type { SavingCapacityPoint } from '@/hooks/useSavingCapacity'
import type { MonthlyOp, MonthlyOpsMap } from '@/hooks/useMonthlyOps'

function position(overrides: Partial<PositionRow>): PositionRow {
  return {
    kind: 'position',
    id: 'x',
    name: 'Asset X',
    ticker: 'XYZ',
    isin: '',
    account: 'acc1',
    status: 'active',
    operationTypes: new Set(),
    total_value: 1000,
    unrealized_gain: 100,
    unrealized_gain_net: 70,
    unrealized_gain_pct: 11.1,
    realized_gain: 0,
    realized_gain_net: 0,
    tax_rate: 0.3,
    total_dividends: 0,
    total_dividends_net: 0,
    total_interest: 0,
    total_interest_net: 0,
    total_realized_return: 0,
    total_invested: 900,
    total_return_pct: 11.1,
    xirr: 10,
    subRows: [],
    ...overrides,
  }
}

describe('computeTopPerformers', () => {
  it('keeps only active positions with non-zero unrealized P&L, sorted best to worst', () => {
    const positions = [
      position({ id: 'a', name: 'Winner', ticker: 'WIN', unrealized_gain_pct: 25, unrealized_gain: 250, total_value: 1250, account_type: 'PEA' }),
      position({ id: 'b', name: 'Loser', ticker: 'LOSE', unrealized_gain_pct: -10, unrealized_gain: -100, total_value: 900, account_type: 'CTO' }),
      position({ id: 'c', name: 'Flat', ticker: 'FLAT', unrealized_gain_pct: 0 }),
      position({ id: 'd', name: 'Closed', status: 'closed', unrealized_gain_pct: 50 }),
    ]
    expect(computeTopPerformers(positions)).toEqual([
      { label: 'WIN', name: 'Winner', pct: 25, gain: 250, value: 1250, account_type: 'PEA' },
      { label: 'LOSE', name: 'Loser', pct: -10, gain: -100, value: 900, account_type: 'CTO' },
    ])
  })

  it('returns an empty list when positions are not provided', () => {
    expect(computeTopPerformers(undefined)).toEqual([])
  })
})

describe('computeTrailing12mSavings', () => {
  it('sums the trailing 12-month window for each of the last 12 months', () => {
    const points: SavingCapacityPoint[] = Array.from({ length: 24 }, (_, i) => ({
      date: `idx-${i}`,
      savings_delta: 100,
      perf_delta: 10,
    }))
    const last12 = computeTrailing12mSavings(points)
    expect(last12).toHaveLength(12)
    expect(last12[0].rolling_12m).toBe(1200)
    expect(last12[0].rolling_perf_12m).toBe(120)
    expect(last12[11].rolling_12m).toBe(1200)
  })

  it('clamps the rolling window when there is less than 12 months of history', () => {
    const points: SavingCapacityPoint[] = [
      { date: '2024-01', savings_delta: 100, perf_delta: 5 },
      { date: '2024-02', savings_delta: 200, perf_delta: 5 },
    ]
    const last12 = computeTrailing12mSavings(points)
    expect(last12).toHaveLength(2)
    // Sums all available history rather than a strict 12-month window.
    expect(last12[1].rolling_12m).toBe(300)
  })
})

describe('buildAccountTypeLabels', () => {
  it('appends a formatted "value +pct%" label to each account type point', () => {
    const result = buildAccountTypeLabels([
      { account_type: 'PEA', total_cost_basis: 1000, unrealized_gain: 200, total_value: 1200 },
      { account_type: 'Livret', total_cost_basis: 0, unrealized_gain: 0, total_value: 0 },
    ])
    expect(result).toEqual([
      { account_type: 'PEA', total_cost_basis: 1000, unrealized_gain: 200, total_value: 1200, _label: '1k€ +20%' },
      { account_type: 'Livret', total_cost_basis: 0, unrealized_gain: 0, total_value: 0, _label: '0€ +0%' },
    ])
  })

  it('returns an empty list when no data is provided', () => {
    expect(buildAccountTypeLabels(undefined)).toEqual([])
  })
})

describe('filterMonthlyOpsByAccounts', () => {
  function makeOps(): MonthlyOpsMap {
    const map: MonthlyOpsMap = new Map()
    map.set('2024-01', [
      { date: '2024-01-05', account: 'a1', operation_type: 'DEPOSIT', total_amount: 100, label: '' },
      { date: '2024-01-10', account: 'a2', operation_type: 'DEPOSIT', total_amount: 50, label: '' },
    ] as MonthlyOp[])
    return map
  }

  it('returns the map unchanged when no account filter is set', () => {
    const ops = makeOps()
    expect(filterMonthlyOpsByAccounts(ops)).toBe(ops)
    expect(filterMonthlyOpsByAccounts(ops, new Set())).toBe(ops)
  })

  it('filters each month\'s operations down to the selected accounts', () => {
    const result = filterMonthlyOpsByAccounts(makeOps(), new Set(['a1']))
    expect(result.get('2024-01')).toEqual([
      { date: '2024-01-05', account: 'a1', operation_type: 'DEPOSIT', total_amount: 100, label: '' },
    ])
  })
})
