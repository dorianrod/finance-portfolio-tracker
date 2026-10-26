import { describe, expect, it } from 'vitest'

import type { HistoryPoint } from '@/domains/portfolio/features/holdings/features/positions/types/historyPoint.type'

import { buildSavingsHistorySeries } from './buildSavingsHistorySeries'

describe('savings preview history', () => {
  it.each([undefined, null, []])(
    'uses dated operations when snapshots are %s',
    (history) => {
      expect(
        buildSavingsHistorySeries(history, [
          { date: new Date('2026-02-01'), total_amount: -25 },
          { date: new Date('2026-01-15'), total_amount: 100 },
        ]),
      ).toEqual([
        { month: '2026-01', balance: 100, delta: 100 },
        { month: '2026-02', balance: 75, delta: -25 },
      ])
    },
  )

  it('uses snapshot changes instead of adding the operation fallback twice', () => {
    const history: HistoryPoint[] = [
      {
        date: new Date('2026-01-31'),
        value: 100.4,
        costBasis: 100,
        pct: null,
        last_price: 0,
      },
      {
        date: new Date('2026-02-28'),
        value: 74.6,
        costBasis: 75,
        pct: null,
        last_price: 0,
      },
    ]
    expect(
      buildSavingsHistorySeries(history, [
        { date: new Date('2026-01-15'), total_amount: 500 },
      ]),
    ).toEqual([
      { month: '2026-01', balance: 100, delta: 0 },
      { month: '2026-02', balance: 75, delta: -26 },
    ])
    expect(history[0].value).toBe(100.4)
  })
})
