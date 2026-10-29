import { describe, expect, it } from 'vitest'

import { buildPositionRows } from '@/domains/portfolio/shared/helpers/mappers/buildPositionHierarchy/buildPositionRows'
import { op } from '@/domains/portfolio/shared/mocks/rawOperation.mock'
import { pos } from '@/domains/portfolio/shared/mocks/rawPosition.mock'

describe('buildPositionRows', () => {
  it('keeps asset and account identities distinct when their names contain separators', () => {
    const rows = buildPositionRows(
      [
        op({ isin: '', ticker: '', name: 'Fund|Class', account: 'Broker' }),
        op({ isin: '', ticker: '', name: 'Fund', account: 'Class|Broker' }),
      ],
      [
        pos({
          isin: '',
          ticker: '',
          name: 'Fund|Class',
          account: 'Broker',
          total_value: 100,
        }),
        pos({
          isin: '',
          ticker: '',
          name: 'Fund',
          account: 'Class|Broker',
          total_value: 200,
        }),
      ],
    )

    expect(
      rows.map(({ account, total_value }) => ({ account, total_value })),
    ).toEqual([
      { account: 'Class|Broker', total_value: 200 },
      { account: 'Broker', total_value: 100 },
    ])
    expect(new Set(rows.map((row) => row.id)).size).toBe(2)
  })

  it('builds an active position with a Dividends group and a Buys / Sells group', () => {
    const ops = [
      op({
        operation_type: 'BUY',
        date: new Date('2023-01-01'),
        total_amount: -1000,
        quantity: 10,
        price_per_unit: 100,
      }),
      op({
        operation_type: 'DIVIDEND',
        date: new Date('2024-01-01'),
        total_amount: 50,
        quantity: 0,
        price_per_unit: 0,
      }),
    ]
    const rows = buildPositionRows(ops, [pos({})])

    expect(rows).toHaveLength(1)
    const row = rows[0]
    expect(row.status).toBe('active')
    expect(row.quantity).toBe(10)
    expect(row.last_price).toBe(120)
    expect(row.total_value).toBe(1200)
    expect(row.xirr_rolling_3y).toBe(8.25)
    expect(row.xirr_rolling_period_years).toBe(3)
    // total_dividends comes from the latest position snapshot, not a recount of ops
    expect(row.total_dividends).toBe(50)
    expect(row.subRows.map((g) => g.groupType)).toEqual(['dividends', 'trades'])
  })

  it('marks a position with no matching latest snapshot as closed and sums realized gain from sells', () => {
    const ops = [
      op({
        isin: 'FR9999',
        operation_type: 'SELL',
        total_amount: 500,
        realized_gain: 50,
      }),
    ]
    const rows = buildPositionRows(ops, [])
    expect(rows[0].status).toBe('closed')
    expect(rows[0].realized_gain).toBe(50)
  })

  it('passes through account_type from the pipeline CSV including "– Cash" suffix', () => {
    const ops = [
      op({
        isin: '',
        ticker: '',
        name: 'Cash CTO',
        operation_type: 'DEPOSIT',
        total_amount: 1000,
      }),
    ]
    const rows = buildPositionRows(ops, [
      pos({
        isin: '',
        ticker: '',
        name: 'Cash CTO',
        account_type: 'Bourse – Cash',
        account_category: 'brokerage',
      }),
    ])
    expect(rows[0].account_type).toBe('Bourse – Cash')
  })

  it('sorts active positions before closed ones', () => {
    const activeOp = op({ isin: 'ACTIVE', operation_type: 'BUY' })
    const closedOp = op({
      isin: 'CLOSED',
      operation_type: 'SELL',
      total_amount: 100,
      realized_gain: 0,
    })
    const rows = buildPositionRows(
      [closedOp, activeOp],
      [pos({ isin: 'ACTIVE' })],
    )
    expect(rows.map((r) => r.isin)).toEqual(['ACTIVE', 'CLOSED'])
  })

  it('gives the same asset held in two accounts one row per account, each with its own account_type', () => {
    const ops = [
      op({
        isin: 'SPLIT',
        account: 'pea',
        operation_type: 'BUY',
        quantity: 10,
        total_amount: -1000,
      }),
      op({
        isin: 'SPLIT',
        account: 'cto',
        operation_type: 'BUY',
        quantity: 5,
        total_amount: -500,
      }),
    ]
    const rows = buildPositionRows(ops, [
      pos({ isin: 'SPLIT', account: 'pea', account_type: 'Bourse' }),
      pos({ isin: 'SPLIT', account: 'cto', account_type: 'Bourse' }),
    ])
    expect(rows).toHaveLength(2)
    expect(rows.map((r) => r.account).toSorted()).toEqual(['cto', 'pea'])
    expect(rows.every((r) => r.account_type === 'Bourse')).toBe(true)
  })

  it('uses the latest snapshot and operations on or before an as-of date', () => {
    const rows = buildPositionRows(
      [
        op({ date: new Date('2024-01-01'), total_amount: -1000 }),
        op({
          date: new Date('2025-01-01'),
          operation_type: 'DIVIDEND',
          total_amount: 99,
        }),
      ],
      [
        pos({ snapshot_date: new Date('2024-06-01'), total_value: 1200 }),
        pos({ snapshot_date: new Date('2025-06-01'), total_value: 1800 }),
      ],
      new Date('2024-12-31'),
    )
    expect(rows[0].total_value).toBe(1200)
    expect(
      rows[0].subRows
        .flatMap((group) => group.subRows)
        .map((item) => item.date),
    ).toEqual([new Date('2024-01-01')])
  })
})
