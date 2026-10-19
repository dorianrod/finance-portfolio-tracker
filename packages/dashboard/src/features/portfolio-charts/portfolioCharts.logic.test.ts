import { describe, it, expect } from 'vitest'
import {
  buildAccountTypeLabels,
  buildCumulativeConcentration,
  buildTriChartData,
  buildCumulativeWealthDrivers,
  computeConcentration,
  computeHeldAssetConcentration,
  computePerformanceSummary,
  computePeriodDrivers,
  computeTrailing12mYearOverYear,
  computeTopPerformers,
  computeTrailing12mIncome,
  computeTrailing12mSavings,
  filterMonthlyOpsByAccounts,
  filterPointsByPeriod,
} from './portfolioCharts.logic'
import { CASH_ACCOUNT_FILTER_SUFFIX } from '@/shared/filters/accountFilter'
import type { PositionRow } from '@/types/domain'
import type { SavingCapacityPoint } from '@/hooks/useSavingCapacity'
import type { MonthlyOp, MonthlyOpsMap } from '@/hooks/useMonthlyOps'
import type { PortfolioHistoryPoint } from '@/types/history'

function historyPoint(
  date: string,
  tri1y: number | null,
  tri3y: number | null,
): PortfolioHistoryPoint {
  return {
    date,
    total_value: 0,
    total_cost_basis: 0,
    unrealized_gain: 0,
    net_cash_injected: 0,
    cash_delta: null,
    tri: null,
    tri_rolling_1y: tri1y,
    tri_rolling_3y: tri3y,
  }
}

describe('buildTriChartData', () => {
  it('starts at the first history point and backfills each missing rolling span with its first value', () => {
    const result = buildTriChartData([
      historyPoint('2021-01-01', null, null),
      historyPoint('2022-01-01', 8, null),
      historyPoint('2023-01-01', 10, null),
      historyPoint('2024-01-01', 12, 7),
      historyPoint('2025-01-01', 9, 6),
    ])

    expect(result.map((point) => point.date)).toEqual([
      '2021-01-01', '2022-01-01', '2023-01-01', '2024-01-01', '2025-01-01',
    ])
    expect(result.map((point) => point.tri_rolling_1y_backfill)).toEqual([8, 8, null, null, null])
    expect(result.map((point) => point.tri_rolling_3y_backfill)).toEqual([7, 7, 7, 7, null])
    expect(result.map((point) => point.tri_rolling_3y)).toEqual([null, null, null, 7, 6])
  })

  it('returns no chart data when no rolling IRR exists', () => {
    expect(buildTriChartData([historyPoint('2021-01-01', null, null)])).toEqual([])
  })
})

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
    quantity: 10,
    last_price: 100,
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
    xirr_rolling_3y: 8,
    xirr_rolling_period_years: 3,
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
      { label: 'Winner', name: 'Winner', pct: 25, gain: 250, value: 1250, account_type: 'PEA' },
      { label: 'Loser', name: 'Loser', pct: -10, gain: -100, value: 900, account_type: 'CTO' },
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

  it('maps synthetic cash account ids back to raw operation accounts', () => {
    const result = filterMonthlyOpsByAccounts(
      makeOps(),
      new Set([`a1${CASH_ACCOUNT_FILTER_SUFFIX}`]),
    )

    expect(result.get('2024-01')).toEqual([
      { date: '2024-01-05', account: 'a1', operation_type: 'DEPOSIT', total_amount: 100, label: '' },
    ])
  })
})

describe('wealth driver helpers', () => {
  const points: SavingCapacityPoint[] = [
    { date: '2024-01-31', savings_delta: 100, perf_delta: 10 },
    { date: '2024-02-29', savings_delta: 50, perf_delta: -20 },
    { date: '2024-03-31', savings_delta: -25, perf_delta: 30 },
  ]

  it('filters points inclusively by date', () => {
    expect(filterPointsByPeriod(points, '2024-02-01', '2024-02-29')).toEqual([points[1]])
  })

  it('builds cumulative savings, performance and total change', () => {
    expect(buildCumulativeWealthDrivers(points).at(-1)).toMatchObject({
      cumulative_savings: 125,
      cumulative_performance: 20,
      cumulative_change: 145,
    })
  })

  it('summarises change drivers for a period', () => {
    expect(computePeriodDrivers(points)).toEqual({ savings: 125, performance: 20, change: 145 })
  })

  it('compares the trailing twelve months with the preceding twelve-month window', () => {
    const points: SavingCapacityPoint[] = Array.from({ length: 24 }, (_, index) => ({
      date: new Date(Date.UTC(2024, 10 + index, 28)).toISOString().slice(0, 10),
      savings_delta: index < 12 ? 100 : 150,
      perf_delta: index < 12 ? 50 : -25,
    }))
    const result = computeTrailing12mYearOverYear(points)

    expect(result).toEqual({
      currentMonths: [
        '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04',
        '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10',
      ],
      comparisonMonths: [
        '2024-11', '2024-12', '2025-01', '2025-02', '2025-03', '2025-04',
        '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10',
      ],
      savings: { current: 1800, previous: 1200, changePct: 50 },
      performance: { current: -300, previous: 600, changePct: -150 },
    })
  })

  it('does not report an incomplete trailing twelve-month window', () => {
    const result = computeTrailing12mYearOverYear([
      { date: '2025-10-31', savings_delta: 1000, perf_delta: 100 },
      { date: '2026-10-11', savings_delta: 2000, perf_delta: 200 },
    ])

    expect(result.savings).toEqual({ current: null, previous: null, changePct: null })
    expect(result.performance).toEqual({ current: null, previous: null, changePct: null })
  })
})

describe('computeTrailing12mIncome', () => {
  it('uses the latest recorded income date as the end of its trailing window', () => {
    const p = position({
      subRows: [{
        kind: 'group', id: 'income', label: 'Dividends', subRows: [
          { kind: 'operation', id: 'old', date: '2023-12-31', account: 'acc1', operation_type: 'DIVIDEND', quantity: null, price_per_unit: null, total_amount: 100, realized_gain: null },
          { kind: 'operation', id: 'div', date: '2024-06-01', account: 'acc1', operation_type: 'DIVIDEND', quantity: null, price_per_unit: null, total_amount: 25, realized_gain: null },
          { kind: 'operation', id: 'interest', date: '2024-12-31', account: 'acc1', operation_type: 'INTEREST', quantity: null, price_per_unit: null, total_amount: 10, realized_gain: null },
        ],
      }],
    })
    expect(computeTrailing12mIncome([p])).toEqual({
      dividends: 25,
      interest: 10,
      total: 35,
      previousTotal: 100,
      changePct: -65,
      dateFrom: '2023-12-31',
      dateTo: '2024-12-31',
    })
  })

  it('anchors both rolling income windows to the supplied portfolio date', () => {
    const p = position({
      subRows: [{
        kind: 'group', id: 'income', label: 'Passive income', subRows: [
          { kind: 'operation', id: 'previous', date: '2024-06-01', account: 'acc1', operation_type: 'DIVIDEND', quantity: null, price_per_unit: null, total_amount: 100, realized_gain: null },
          { kind: 'operation', id: 'current', date: '2025-06-01', account: 'acc1', operation_type: 'INTEREST', quantity: null, price_per_unit: null, total_amount: 150, realized_gain: null },
        ],
      }],
    })

    expect(computeTrailing12mIncome([p], '2025-12-31')).toMatchObject({
      total: 150,
      previousTotal: 100,
      changePct: 50,
      dateFrom: '2024-12-31',
      dateTo: '2025-12-31',
    })
  })
})

describe('portfolio summaries', () => {
  it('keeps the full ranked concentration while preserving the top-ten summary', () => {
    const result = computeHeldAssetConcentration(
      Array.from({ length: 12 }, (_, index) => position({
        id: `asset-${index}`,
        isin: `ISIN-${index}`,
        name: `Asset ${index}`,
        total_value: 12 - index,
      })),
    )

    expect(result.allHoldings).toHaveLength(12)
    expect(result.holdings).toHaveLength(10)
    expect(result.allHoldings.map((holding) => holding.value)).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(result.topTenValue).toBe(75)
  })

  it('builds a sorted monotone cumulative concentration from every holding', () => {
    const result = buildCumulativeConcentration([
      { label: 'Small', name: 'Small', value: 20, weight: 20 },
      { label: 'Large', name: 'Large', value: 50, weight: 50 },
      { label: 'Medium', name: 'Medium', value: 30, weight: 30 },
    ])

    expect(result.map((point) => point.name)).toEqual(['Large', 'Medium', 'Small'])
    expect(result.map((point) => point.rank)).toEqual([1, 2, 3])
    expect(result.map((point) => point.cumulativeWeight)).toEqual([50, 80, 100])
  })

  it('computes the non-decomposed concentration at held-asset grain', () => {
    const result = computeHeldAssetConcentration([
      position({ id: 'fund-a', isin: 'FUND-A', name: 'World ETF', account: 'acc1', total_value: 600 }),
      position({ id: 'fund-b', isin: 'FUND-A', name: 'World ETF', account: 'acc2', total_value: 200 }),
      position({ id: 'account', isin: '', ticker: '', name: 'PEE product', total_value: 200 }),
    ])

    expect(result.holdings).toHaveLength(2)
    expect(result.holdings[0]).toMatchObject({ name: 'World ETF', value: 800, weight: 80 })
    expect(result.holdings[1]).toMatchObject({ name: 'PEE product', value: 200, weight: 20 })
    expect(result.topTenValue).toBe(1_000)
    expect(result.topTenPct).toBe(100)
    expect(result.coveragePct).toBe(100)
  })

  it('aggregates the same asset across accounts for concentration', () => {
    const result = computeConcentration([
      position({ id: 'a', isin: 'FR1', total_value: 600 }),
      position({ id: 'b', isin: 'FR1', total_value: 200 }),
      position({ id: 'c', isin: 'FR2', ticker: 'OTHER', total_value: 200 }),
    ])
    expect(result.topHoldingPct).toBe(80)
    expect(result.topFivePct).toBe(100)
    expect(result.holdings[0].value).toBe(800)
    expect(result.holdings[1].label).toBe('Asset X')
  })

  it('excludes synthetic brokerage cash from concentration', () => {
    const positions = [
      position({ id: 'asset', isin: 'FR1', name: 'Invested asset', total_value: 100 }),
      position({ id: 'cash', isin: '', ticker: '', name: 'Cash CTO', account_type: 'Bourse – Cash', account_category: 'brokerage', total_value: 900 }),
    ]

    const held = computeHeldAssetConcentration(positions)
    const lookThrough = computeConcentration(positions)

    expect(held).toMatchObject({ identifiedValue: 100, selectedValue: 100 })
    expect(held.holdings).toMatchObject([{ name: 'Invested asset', weight: 100 }])
    expect(lookThrough).toMatchObject({ identifiedValue: 100, opaqueValue: 0, selectedValue: 100 })
    expect(lookThrough.holdings).toMatchObject([{ name: 'Invested asset', weight: 100 }])
  })

  it('looks through funds and aggregates the same underlying direct and indirect exposure', () => {
    const result = computeConcentration([
      position({ id: 'fund-a', isin: 'FUND-A', name: 'World ETF', total_value: 1_000 }),
      position({ id: 'fund-b', isin: 'FUND-B', name: 'US UCITS ETF', total_value: 500 }),
      position({ id: 'direct', isin: 'DIRECT-ASSET', name: 'Direct Asset', total_value: 100 }),
      position({ id: 'account', isin: '', ticker: '', name: 'Broker account', total_value: 10_000 }),
    ], [
      { parentIsin: 'FUND-A', parentTicker: '', parentName: 'World ETF', holdingId: 'DIRECT-ASSET', holdingName: 'Direct Asset', issuerId: 'DIRECT-ASSET', issuerName: 'Direct Asset', weight: 0.1, sourceTier: 'A', sourceName: 'Official', holdingsDate: '2026-10-01' },
      { parentIsin: 'FUND-A', parentTicker: '', parentName: 'World ETF', holdingId: 'US0378331005', holdingName: 'Apple', issuerId: 'apple', issuerName: 'Apple', weight: 0.08, sourceTier: 'A', sourceName: 'Official', holdingsDate: '2026-10-01' },
      { parentIsin: 'FUND-B', parentTicker: '', parentName: 'US UCITS ETF', holdingId: 'DIRECT-ASSET', holdingName: 'Direct Asset', issuerId: 'DIRECT-ASSET', issuerName: 'Direct Asset', weight: 0.2, sourceTier: 'A', sourceName: 'Official', holdingsDate: '2026-10-01' },
    ])

    expect(result.holdings[0]).toMatchObject({
      label: 'Direct Asset',
      name: 'Direct Asset',
      value: 300,
      weight: 300 / 11600 * 100,
    })
    expect(result.holdings[1].value).toBe(80)
    expect(result.topTenValue).toBe(380)
    expect(result.topTenPct).toBeCloseTo(380 / 11600 * 100)
    expect(result.coveragePct).toBeCloseTo(380 / 11600 * 100)
    expect(result.undisclosedValue).toBe(1_220)
    expect(result.opaqueValue).toBe(10_000)
    expect(buildCumulativeConcentration(result.allHoldings).at(-1)?.cumulativeWeight)
      .toBeCloseTo(result.coveragePct)
  })

  it('does not rank account valuations or opaque funds as underlying assets', () => {
    const result = computeConcentration([
      position({ id: 'account', isin: '', ticker: '', name: 'PEE account', total_value: 1_000 }),
      position({ id: 'opaque-fund', isin: 'FUND-X', name: 'Opaque ETF', total_value: 500 }),
    ])

    expect(result.holdings).toEqual([])
    expect(result.coveragePct).toBe(0)
  })

  it('computes net current value and total net performance', () => {
    const result = computePerformanceSummary([
      position({
        total_value: 1000,
        unrealized_gain: 100,
        unrealized_gain_net: 70,
        realized_gain: 50,
        realized_gain_net: 35,
        total_dividends: 20,
        total_dividends_net: 14,
        total_invested: 900,
      }),
    ])
    expect(result).toMatchObject({
      currentValueNet: 970,
      currentValueGross: 1000,
      unrealizedNet: 70,
      realizedNet: 35,
      realizedGross: 50,
      incomeNet: 14,
      totalPerformanceGross: 170,
      totalPerformanceNet: 119,
    })
  })
})
