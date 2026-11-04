import { describe, expect, it, vi } from 'vitest'

import { DemoScopeUnavailableError } from '@/domains/portfolio/shared/apis/queries/useGetFilteredPortfolioHistoryQuery/demoScopeUnavailableError'
import { requestFilteredPortfolioHistory } from '@/domains/portfolio/shared/apis/queries/useGetFilteredPortfolioHistoryQuery/requestFilteredPortfolioHistory'

const payload = {
  accounts: ['a', 'b'],
  history: [
    {
      snapshot_date: new Date('2026-10-12'),
      total_value: 100,
      total_cost_basis: 90,
      unrealized_gain: 10,
      net_cash_injected: 80,
      cash_delta: 0,
      tri: 12,
      tri_rolling_1y: 15,
      tri_rolling_3y: 9,
    },
  ],
}

function jsonResponse(body: object, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('requestFilteredPortfolioHistory', () => {
  it('posts normalized accounts to the local Python API', async () => {
    const fetchMock = vi.fn<typeof fetch>(
      async (...request: Parameters<typeof fetch>) => {
        void request
        return jsonResponse(payload)
      },
    )
    const fetchImpl = fetchMock

    const result = await requestFilteredPortfolioHistory(
      ['b::cash', 'a', 'b'],
      new AbortController().signal,
      { staticDemo: false, fetchImpl },
    )

    expect(result).toEqual(payload)
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(
      JSON.parse(await new Response(fetchMock.mock.calls[0][1]?.body).text()),
    ).toEqual({
      accounts: ['a', 'b'],
    })
  })

  it('returns the static demo fixture for its exact recorded scope', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => jsonResponse(payload))

    const result = await requestFilteredPortfolioHistory(
      ['b::cash', 'a'],
      new AbortController().signal,
      { staticDemo: true, fetchImpl },
    )

    expect(result).toEqual(payload)
    expect(fetchImpl).toHaveBeenCalledOnce()
    const [url, options] = fetchImpl.mock.calls[0]
    expect(url).toEqual(expect.stringContaining('demo_filtered_history.json'))
    expect(options?.signal).toBeInstanceOf(AbortSignal)
  })

  it('rejects arbitrary scopes in the static demo', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => jsonResponse(payload))

    await expect(
      requestFilteredPortfolioHistory(['a'], new AbortController().signal, {
        staticDemo: true,
        fetchImpl,
      }),
    ).rejects.toBeInstanceOf(DemoScopeUnavailableError)
  })

  it('surfaces the API error message', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      jsonResponse({ error: 'Unknown accounts: x' }, 400),
    )

    await expect(
      requestFilteredPortfolioHistory(['x'], new AbortController().signal, {
        staticDemo: false,
        fetchImpl,
      }),
    ).rejects.toThrow('Unknown accounts: x')
  })

  it('rejects a successful response whose history data is incomplete', async () => {
    const incompletePoint: Partial<(typeof payload.history)[number]> = {
      ...payload.history[0],
    }
    delete incompletePoint.total_value
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      jsonResponse({
        ...payload,
        history: [incompletePoint],
      }),
    )

    await expect(
      requestFilteredPortfolioHistory(['a'], new AbortController().signal, {
        staticDemo: false,
        fetchImpl,
      }),
    ).rejects.toThrow()
  })

  it.each(['total_value', 'tri_rolling_3y'])(
    'rejects a nonfinite %s in the history response',
    async (field) => {
      const fetchImpl = vi.fn<typeof fetch>(async () =>
        jsonResponse({
          ...payload,
          history: [{ ...payload.history[0], [field]: 'Infinity' }],
        }),
      )
      await expect(
        requestFilteredPortfolioHistory(['a'], new AbortController().signal, {
          staticDemo: false,
          fetchImpl,
        }),
      ).rejects.toThrow()
    },
  )

  it('defaults null history and account arrays without accepting malformed rows', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      jsonResponse({ accounts: null, history: null }),
    )
    await expect(
      requestFilteredPortfolioHistory(['a'], new AbortController().signal, {
        staticDemo: false,
        fetchImpl,
      }),
    ).resolves.toEqual({ accounts: [], history: [] })
  })
})
