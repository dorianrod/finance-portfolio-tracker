import { describe, expect, it, vi } from 'vitest'
import {
  DemoScopeUnavailableError,
  normalizeAccountSelection,
  resolveFilteredHistoryState,
  requestFilteredPortfolioHistory,
} from './useFilteredPortfolioHistory'

const payload = {
  accounts: ['a', 'b'],
  history: [{
    snapshot_date: '2026-10-12',
    total_value: 100,
    total_cost_basis: 90,
    unrealized_gain: 10,
    net_cash_injected: 80,
    cash_delta: 0,
    tri: 12,
    tri_rolling_1y: 15,
    tri_rolling_3y: 9,
  }],
}

function jsonResponse(body: object, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('normalizeAccountSelection', () => {
  it('deduplicates raw accounts and groups their cash rows', () => {
    expect(normalizeAccountSelection(['b::cash', 'a', 'b'])).toEqual(['a', 'b'])
  })
})

describe('resolveFilteredHistoryState', () => {
  const fallback = [{
    date: '2026-10-12', total_value: 100, total_cost_basis: 90,
    unrealized_gain: 10, net_cash_injected: 80, cash_delta: 0,
    tri: null, tri_rolling_1y: null, tri_rolling_3y: null,
  }]

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

describe('requestFilteredPortfolioHistory', () => {
  it('posts normalized accounts to the local Python API', async () => {
    const fetchMock = vi.fn(async (...request: Parameters<typeof fetch>) => {
      void request
      return jsonResponse(payload)
    })
    const fetchImpl = fetchMock as unknown as typeof fetch

    const result = await requestFilteredPortfolioHistory(
      ['b::cash', 'a', 'b'],
      new AbortController().signal,
      { staticDemo: false, fetchImpl },
    )

    expect(result).toEqual(payload)
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({ accounts: ['a', 'b'] })
  })

  it('returns the static demo fixture for its exact recorded scope', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(payload)) as unknown as typeof fetch

    const result = await requestFilteredPortfolioHistory(
      ['b::cash', 'a'],
      new AbortController().signal,
      { staticDemo: true, fetchImpl },
    )

    expect(result).toEqual(payload)
    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining('demo_filtered_history.json'),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('rejects arbitrary scopes in the static demo', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(payload)) as unknown as typeof fetch

    await expect(requestFilteredPortfolioHistory(
      ['a'],
      new AbortController().signal,
      { staticDemo: true, fetchImpl },
    )).rejects.toBeInstanceOf(DemoScopeUnavailableError)
  })

  it('surfaces the API error message', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ error: 'Unknown accounts: x' }, 400)) as unknown as typeof fetch

    await expect(requestFilteredPortfolioHistory(
      ['x'],
      new AbortController().signal,
      { staticDemo: false, fetchImpl },
    )).rejects.toThrow('Unknown accounts: x')
  })
})
