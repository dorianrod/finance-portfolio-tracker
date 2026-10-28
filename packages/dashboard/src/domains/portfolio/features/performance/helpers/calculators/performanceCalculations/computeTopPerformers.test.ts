import { describe, expect, it } from 'vitest'

import { computeTopPerformers } from '@/domains/portfolio/features/performance/helpers/calculators/performanceCalculations/computeTopPerformers'
import { position } from '@/domains/portfolio/shared/mocks/summaryPosition.mock'

describe('computeTopPerformers', () => {
  it('keeps only active positions with non-zero unrealized P&L, sorted best to worst', () => {
    const positions = [
      position({
        id: 'a',
        name: 'Winner',
        ticker: 'WIN',
        unrealized_gain_pct: 25,
        unrealized_gain: 250,
        total_value: 1250,
        account_type: 'PEA',
      }),
      position({
        id: 'b',
        name: 'Loser',
        ticker: 'LOSE',
        unrealized_gain_pct: -10,
        unrealized_gain: -100,
        total_value: 900,
        account_type: 'CTO',
      }),
      position({
        id: 'c',
        name: 'Flat',
        ticker: 'FLAT',
        unrealized_gain_pct: 0,
      }),
      position({
        id: 'd',
        name: 'Closed',
        status: 'closed',
        unrealized_gain_pct: 50,
      }),
    ]
    expect(computeTopPerformers(positions)).toEqual([
      {
        label: 'Winner',
        name: 'Winner',
        pct: 25,
        gain: 250,
        value: 1250,
        account_type: 'PEA',
      },
      {
        label: 'Loser',
        name: 'Loser',
        pct: -10,
        gain: -100,
        value: 900,
        account_type: 'CTO',
      },
    ])
  })

  it('returns an empty list when positions are not provided', () => {
    expect(computeTopPerformers(undefined)).toEqual([])
  })
})
