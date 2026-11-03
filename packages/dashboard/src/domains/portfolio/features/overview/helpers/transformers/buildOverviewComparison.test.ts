import { describe, expect, it } from 'vitest'

import { buildGrossValueHistory } from '@/domains/portfolio/features/overview/helpers/transformers/buildOverviewComparison/buildGrossValueHistory'
import { buildOverviewComparison } from '@/domains/portfolio/features/overview/helpers/transformers/buildOverviewComparison/buildOverviewComparison'
import { compareRollingThreeYearIrr } from '@/domains/portfolio/features/overview/helpers/transformers/buildOverviewComparison/compareRollingThreeYearIrr'
import { resolveOverviewWindows } from '@/domains/portfolio/features/overview/helpers/transformers/buildOverviewComparison/resolveOverviewWindows'
import { operation } from '@/domains/portfolio/features/overview/mocks/overviewOperation.mock'
import { position } from '@/domains/portfolio/features/overview/mocks/overviewPosition.mock'
import { makePortfolioHistoryPoint as fixturePortfolioHistoryPoint } from '@/domains/portfolio/shared/mocks/portfolioHistoryPoint.mock'
import { makeSavingCapacityPoint as fixtureSavingCapacityPoint } from '@/domains/portfolio/shared/mocks/savingCapacityPoint.mock'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

describe('resolveOverviewWindows', () => {
  const dates = [new Date('2024-01-31'), new Date('2026-10-20')]

  it('defaults to a trailing year and an immediately preceding equal window', () => {
    expect(resolveOverviewWindows(dates)).toEqual({
      current: { start: new Date('2025-10-21'), end: new Date('2026-10-20') },
      previous: { start: new Date('2024-10-21'), end: new Date('2025-10-20') },
      defaultedToTrailingYear: true,
    })
  })

  it('keeps custom month boundaries equal and non-overlapping', () => {
    expect(
      resolveOverviewWindows(
        dates,
        new Date('2026-01-01'),
        new Date('2026-01-31'),
      ),
    ).toEqual({
      current: { start: new Date('2026-01-01'), end: new Date('2026-01-31') },
      previous: { start: new Date('2025-12-01'), end: new Date('2025-12-31') },
      defaultedToTrailingYear: false,
    })
  })

  it('uses the latest observation for a start-only period', () => {
    expect(
      resolveOverviewWindows(dates, new Date('2026-10-01'))?.current,
    ).toEqual({
      start: new Date('2026-10-01'),
      end: new Date('2026-10-20'),
    })
  })

  it('uses available history for an end-only period and rejects reversed ranges', () => {
    expect(
      resolveOverviewWindows(dates, undefined, new Date('2026-01-31'))?.current,
    ).toEqual({
      start: new Date('2024-01-31'),
      end: new Date('2026-01-31'),
    })
    expect(
      resolveOverviewWindows(
        dates,
        new Date('2026-05-01'),
        new Date('2026-01-31'),
      ),
    ).toBeNull()
  })
})

describe('buildGrossValueHistory', () => {
  it('computes historical gross value and respects account filters', () => {
    const rows = [
      position({
        account: 'A',
        total_value: 100,
        unrealized_gain: 20,
        unrealized_gain_net: 14,
      }),
      position({
        account: 'B',
        total_value: 300,
        unrealized_gain: 50,
        unrealized_gain_net: 35,
      }),
    ]

    expect(buildGrossValueHistory(rows, new Set(['A']))).toEqual([
      { date: new Date('2025-01-31'), value: 100 },
    ])
  })

  it('does not adjust the market value for unrealized tax fields', () => {
    expect(
      buildGrossValueHistory([
        position({
          total_value: 100,
          unrealized_gain: 20,
          unrealized_gain_net: 14,
        }),
      ])[0].value,
    ).toBe(100)
  })
})

describe('compareRollingThreeYearIrr', () => {
  it('compares the rolling three-year IRR at each period end', () => {
    const point = (date: Date, tri: number): PortfolioHistoryPoint =>
      fixturePortfolioHistoryPoint({
        date,
        total_value: 0,
        total_cost_basis: 0,
        unrealized_gain: 0,
        net_cash_injected: 0,
        tri_rolling_3y: tri,
      })
    const result = compareRollingThreeYearIrr(
      [point(new Date('2025-10-20'), 6.2), point(new Date('2026-10-20'), 8.4)],
      {
        current: { start: new Date('2025-10-21'), end: new Date('2026-10-20') },
        previous: {
          start: new Date('2024-10-21'),
          end: new Date('2025-10-20'),
        },
        defaultedToTrailingYear: true,
      },
    )

    expect(result).toMatchObject({ current: 8.4, previous: 6.2, delta: 2.2 })
  })
})

describe('buildOverviewComparison', () => {
  it('compares point-in-time values and period flows for the selected account', () => {
    const comparison = buildOverviewComparison({
      rawPositions: [
        position({
          snapshot_date: new Date('2025-01-31'),
          isin: 'A1',
          name: 'A1',
          total_value: 70,
          unrealized_gain: 0,
          unrealized_gain_net: 0,
        }),
        position({
          snapshot_date: new Date('2025-01-31'),
          isin: 'A2',
          name: 'A2',
          total_value: 30,
          unrealized_gain: 0,
          unrealized_gain_net: 0,
        }),
        position({
          snapshot_date: new Date('2025-02-28'),
          isin: 'A1',
          name: 'A1',
          total_value: 70,
          unrealized_gain: 0,
          unrealized_gain_net: 0,
        }),
        position({
          snapshot_date: new Date('2025-02-28'),
          isin: 'A2',
          name: 'A2',
          total_value: 70,
          unrealized_gain: 0,
          unrealized_gain_net: 0,
        }),
        position({
          snapshot_date: new Date('2025-02-28'),
          account: 'B',
          isin: 'B1',
          total_value: 1000,
          unrealized_gain: 0,
          unrealized_gain_net: 0,
        }),
      ],
      rawOperations: [
        operation({ date: new Date('2025-01-15'), total_amount: 10 }),
        operation({
          date: new Date('2025-02-15'),
          operation_type: 'INTEREST',
          total_amount: 25,
        }),
        operation({
          date: new Date('2025-02-15'),
          account: 'B',
          total_amount: 999,
        }),
      ],
      savingCapacity: [
        fixtureSavingCapacityPoint(),
        fixtureSavingCapacityPoint({
          date: new Date('2025-02-28'),
          savings_delta: 150,
          perf_delta: -10,
        }),
      ],
      fundHoldingsHistory: [],
      accountFilters: new Set(['A']),
      dateFrom: new Date('2025-02-01'),
      dateTo: new Date('2025-02-28'),
    })

    expect(comparison).not.toBeNull()
    expect(comparison?.value).toMatchObject({
      current: 140,
      previous: 100,
      delta: 40,
      deltaPct: 40,
    })
    expect(comparison?.contributions).toMatchObject({
      current: 150,
      previous: 100,
      delta: 50,
      deltaPct: 50,
    })
    expect(comparison?.marketPerformance).toMatchObject({
      current: -10,
      previous: 20,
      delta: -30,
      deltaPct: -150,
    })
    expect(comparison?.passiveIncome).toMatchObject({
      current: 25,
      previous: 10,
      delta: 15,
      deltaPct: 150,
    })
    expect(comparison?.heldConcentration.topHolding).toMatchObject({
      current: 50,
      previous: 70,
      delta: -20,
    })
    expect(comparison?.lookThroughConcentration.current).toBeNull()
  })

  it('uses tax data at the selected period end and does not use a future valuation', () => {
    const result = buildOverviewComparison({
      rawPositions: [
        position({
          snapshot_date: new Date('2025-01-31'),
          total_value: 100,
          unrealized_gain: 20,
          unrealized_gain_net: 14,
        }),
        position({
          snapshot_date: new Date('2025-02-28'),
          total_value: 200,
          unrealized_gain: 50,
          unrealized_gain_net: 35,
        }),
      ],
      rawOperations: [],
      savingCapacity: [],
      fundHoldingsHistory: [],
      dateFrom: new Date('2025-02-01'),
      dateTo: new Date('2025-02-15'),
    })
    expect(result?.value.current).toBe(100)
    expect(result?.netValue).toBe(94)
  })

  it('does not invent a relative percentage when the previous value is zero', () => {
    const comparison = buildOverviewComparison({
      rawPositions: [
        position({
          snapshot_date: new Date('2025-01-31'),
          total_value: 0,
          unrealized_gain: 0,
          unrealized_gain_net: 0,
        }),
        position({
          snapshot_date: new Date('2025-02-28'),
          total_value: 100,
          unrealized_gain: 0,
          unrealized_gain_net: 0,
        }),
      ],
      rawOperations: [],
      savingCapacity: [
        fixtureSavingCapacityPoint({ savings_delta: 0, perf_delta: 0 }),
        fixtureSavingCapacityPoint({
          date: new Date('2025-02-28'),
          perf_delta: 0,
        }),
      ],
      fundHoldingsHistory: [],
      dateFrom: new Date('2025-02-01'),
      dateTo: new Date('2025-02-28'),
    })

    expect(comparison?.value.deltaPct).toBeNull()
    expect(comparison?.contributions.deltaPct).toBeNull()
  })
})
