import { describe, expect, it } from 'vitest'

import { CASH_ACCOUNT_FILTER_SUFFIX } from '@/domains/portfolio/shared/helpers/filters/accountFilter/cashAccountFilterSuffix'
import { applyPositionFilters } from '@/domains/portfolio/shared/helpers/filters/portfolioDataFilters/applyPositionFilters'
import { baseFilters } from '@/domains/portfolio/shared/mocks/dashboardFilters.mock'
import { position } from '@/domains/portfolio/shared/mocks/filteredPosition.mock'
import { group } from '@/domains/portfolio/shared/mocks/groupRow.mock'
import { op } from '@/domains/portfolio/shared/mocks/operationRow.mock'

describe('applyPositionFilters', () => {
  it('recomputes cash totals for the selected period independently of the translated label', () => {
    const cash = group({
      groupType: 'cash',
      deposit_total: 1500,
      withdrawal_total: 250,
      subRows: [
        op({ id: 'old', operation_type: 'DEPOSIT', total_amount: 1000 }),
        op({
          id: 'deposit',
          date: new Date('2024-02-01'),
          operation_type: 'DEPOSIT',
          total_amount: 500,
        }),
        op({
          id: 'withdrawal',
          date: new Date('2024-02-02'),
          operation_type: 'WITHDRAWAL',
          total_amount: -250,
        }),
      ],
    })
    const [filtered] = applyPositionFilters(
      [position({ subRows: [cash] })],
      baseFilters({ dateFrom: new Date('2024-02-01') }),
    )
    expect(filtered.subRows[0]).toMatchObject({
      groupType: 'cash',
      deposit_total: 500,
      withdrawal_total: 250,
    })
    expect(filtered.subRows[0].subRows.map(({ id }) => id)).toEqual([
      'deposit',
      'withdrawal',
    ])
    expect(cash.deposit_total).toBe(1500)
  })

  it('filters by account when no date range is set, leaving snapshot values untouched', () => {
    const positions = [
      position({ id: 'a', account: 'acc1' }),
      position({ id: 'b', account: 'acc2' }),
    ]
    const result = applyPositionFilters(
      positions,
      baseFilters({ accounts: new Set(['acc1']) }),
    )
    expect(result.map((p) => p.id)).toEqual(['a'])
    expect(result[0].total_value).toBe(1000)
  })

  it('filters synthetic cash separately from positions in the same account', () => {
    const positions = [
      position({ id: 'asset', account: 'acc1', account_type: 'Bourse' }),
      position({ id: 'cash', account: 'acc1', account_type: 'Bourse – Cash' }),
    ]
    const result = applyPositionFilters(
      positions,
      baseFilters({ accounts: new Set([`acc1${CASH_ACCOUNT_FILTER_SUFFIX}`]) }),
    )

    expect(result.map((p) => p.id)).toEqual(['cash'])
  })

  it('recomputes realized gain and dividends from only the operations within the date range', () => {
    const buySellGroup = group({
      groupType: 'trades',
      subRows: [
        op({
          id: 'sell-in',
          date: new Date('2024-03-01'),
          operation_type: 'SELL',
          total_amount: 500,
          realized_gain: 80,
        }),
        op({
          id: 'sell-out',
          date: new Date('2024-09-01'),
          operation_type: 'SELL',
          total_amount: 300,
          realized_gain: 40,
        }),
      ],
    })
    const dividendGroup = group({
      groupType: 'dividends',
      total_dividends: 999, // stale snapshot value; must be recomputed from ops
      dividend_count: 999,
      subRows: [
        op({
          id: 'div-in',
          date: new Date('2024-02-01'),
          operation_type: 'DIVIDEND',
          total_amount: 15,
          realized_gain: null,
        }),
        op({
          id: 'div-out',
          date: new Date('2024-12-01'),
          operation_type: 'DIVIDEND',
          total_amount: 25,
          realized_gain: null,
        }),
      ],
    })
    const positions = [
      position({
        subRows: [buySellGroup, dividendGroup],
        realized_gain: 999,
        total_dividends: 999,
      }),
    ]

    const result = applyPositionFilters(
      positions,
      baseFilters({
        dateFrom: new Date('2024-01-01'),
        dateTo: new Date('2024-06-01'),
      }),
    )

    expect(result).toHaveLength(1)
    expect(result[0].realized_gain).toBe(80) // only sell-in falls in range
    expect(result[0].total_dividends).toBe(15) // only div-in falls in range
    expect(result[0].total_realized_return).toBe(95)
    // total_value/unrealized_gain are point-in-time snapshots, unaffected by the date filter
    expect(result[0].total_value).toBe(1000)
  })

  it('keeps an active end-snapshot position even if it has no operation in the date range', () => {
    const positions = [
      position({
        subRows: [
          group({
            groupType: 'trades',
            subRows: [op({ date: new Date('2023-01-01') })],
          }),
        ],
      }),
    ]
    const result = applyPositionFilters(
      positions,
      baseFilters({ dateFrom: new Date('2024-01-01') }),
    )
    expect(result).toHaveLength(1)
    expect(result[0].subRows).toEqual([])
  })

  it('drops a closed position with no operation in the date range', () => {
    const positions = [
      position({
        status: 'closed',
        subRows: [
          group({
            groupType: 'trades',
            subRows: [op({ date: new Date('2023-01-01') })],
          }),
        ],
      }),
    ]
    expect(
      applyPositionFilters(
        positions,
        baseFilters({ dateFrom: new Date('2024-01-01') }),
      ),
    ).toEqual([])
  })
})
