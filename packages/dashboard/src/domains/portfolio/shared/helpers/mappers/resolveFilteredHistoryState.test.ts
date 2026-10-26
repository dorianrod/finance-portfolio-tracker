import { describe, expect, it } from 'vitest'

import { resolveFilteredHistoryState } from './resolveFilteredHistoryState'

describe('resolveFilteredHistoryState', () => {
  const fallback = [
    {
      date: new Date('2026-10-12'),
      total_value: 100,
      total_cost_basis: 90,
      unrealized_gain: 10,
      net_cash_injected: 80,
      cash_delta: 0,
      tri: null,
      tri_rolling_1y: null,
      tri_rolling_3y: null,
    },
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
