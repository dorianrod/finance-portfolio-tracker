import { describe, expect, it } from 'vitest'

import { makePortfolioHistoryPoint as fixturePortfolioHistoryPoint } from '@/domains/portfolio/shared/mocks/portfolioHistoryPoint.mock'

import { resolveFilteredHistoryState } from './resolveFilteredHistoryState'

describe('resolveFilteredHistoryState', () => {
  const fallback = [
    fixturePortfolioHistoryPoint({
      date: new Date('2026-10-12'),
      total_cost_basis: 90,
      unrealized_gain: 10,
      cash_delta: 0,
    }),
  ]

  it('never exposes a response belonging to an older selection', () => {
    const state = resolveFilteredHistoryState(fallback, true, 'new-account', {
      key: 'old-account',
      history: [{ ...fallback[0], tri: 99 }],
      error: null,
    })

    expect(state.history).toBe(fallback)
    expect(state.loading).toBe(true)
    expect(state.history[0].tri).toBeNull()
  })

  it('uses the global fallback immediately when the filter is cleared', () => {
    const state = resolveFilteredHistoryState(fallback, false, '', {
      key: 'old-account',
      history: [{ ...fallback[0], tri: 99 }],
      error: null,
    })

    expect(state).toEqual({ history: fallback, loading: false, error: null })
  })
})
