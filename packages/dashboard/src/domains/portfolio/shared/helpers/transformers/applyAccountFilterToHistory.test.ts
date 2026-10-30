import { describe, expect, it } from 'vitest'

import { CASH_ACCOUNT_FILTER_SUFFIX } from '@/domains/portfolio/shared/helpers/transformers/accountFilter/cashAccountFilterSuffix'
import { rawRow } from '@/domains/portfolio/shared/mocks/rawPositionRow.mock'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

import { applyAccountFilterToHistory } from './applyAccountFilterToHistory'

describe('applyAccountFilterToHistory', () => {
  const enrichedHistory: PortfolioHistoryPoint[] = [
    {
      date: new Date('2024-01-01'),
      total_value: 999,
      total_cost_basis: 999,
      unrealized_gain: 999,
      net_cash_injected: 0,
      cash_delta: null,
      tri: 1.5,
      tri_rolling_1y: null,
      tri_rolling_3y: null,
      total_broker_cash: 50,
    },
  ]

  it('returns the precomputed history unchanged when no account filter is set', () => {
    expect(applyAccountFilterToHistory([], enrichedHistory, new Set())).toBe(
      enrichedHistory,
    )
  })

  it('rebuilds the history from raw per-account snapshots restricted to the selected accounts', () => {
    const rows = [
      rawRow({
        account: 'acc1',
        total_value: 600,
        quantity: 10,
        avg_buy_price: 50,
        unrealized_gain: 100,
      }),
      rawRow({
        account: 'acc2',
        total_value: 9999,
        quantity: 1,
        avg_buy_price: 1,
        unrealized_gain: 9999,
      }),
    ]
    const result = applyAccountFilterToHistory(
      rows,
      enrichedHistory,
      new Set(['acc1']),
    )
    expect(result).toEqual([
      {
        date: new Date('2024-01-01'),
        total_value: 600,
        total_cost_basis: 500, // quantity * avg_buy_price
        unrealized_gain: 100,
        net_cash_injected: 0,
        cash_delta: null,
        tri: null,
        tri_rolling_1y: null,
        tri_rolling_3y: null,
        total_broker_cash: 0,
      },
    ])
  })

  it('sums multiple accounts on the same date', () => {
    const rows = [
      rawRow({
        account: 'acc1',
        total_value: 600,
        quantity: 10,
        avg_buy_price: 50,
        unrealized_gain: 100,
      }),
      rawRow({
        account: 'acc2',
        total_value: 300,
        quantity: 5,
        avg_buy_price: 50,
        unrealized_gain: 50,
      }),
    ]
    const result = applyAccountFilterToHistory(
      rows,
      enrichedHistory,
      new Set(['acc1', 'acc2']),
    )
    expect(result[0].total_value).toBe(900)
    expect(result[0].total_cost_basis).toBe(750)
    expect(result[0].unrealized_gain).toBe(150)
  })

  it('rebuilds history for synthetic cash separately from the same account positions', () => {
    const rows = [
      rawRow({ account: 'acc1', account_type: 'Bourse', total_value: 600 }),
      rawRow({
        account: 'acc1',
        account_type: 'Bourse – Cash',
        total_value: 50,
      }),
    ]
    const result = applyAccountFilterToHistory(
      rows,
      enrichedHistory,
      new Set([`acc1${CASH_ACCOUNT_FILTER_SUFFIX}`]),
    )

    expect(result[0].total_value).toBe(50)
  })
})
