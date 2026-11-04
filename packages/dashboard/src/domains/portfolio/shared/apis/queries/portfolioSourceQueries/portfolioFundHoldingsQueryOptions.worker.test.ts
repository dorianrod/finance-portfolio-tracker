import { QueryClient } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { makeFundHolding } from '@/domains/portfolio/shared/mocks/fundHolding.mock'
import { makeFundHoldingsData } from '@/domains/portfolio/shared/mocks/fundHoldingsData.mock'
import { historicalHolding } from '@/domains/portfolio/shared/mocks/historicalFundHolding.mock'

import type { FundHoldingsWorkerMessage } from './portfolioFundHoldings.worker'
import { PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS } from './portfolioFundHoldingsQueryOptions'

const workers: FundWorker[] = []
class FundWorker {
  onmessage: ((event: MessageEvent<FundHoldingsWorkerMessage>) => void) | null =
    null
  onerror: ((event: { message: string }) => void) | null = null
  postMessage = vi.fn()
  terminate = vi.fn()

  constructor() {
    workers.push(this)
  }
}

let client: QueryClient
beforeEach(() => {
  workers.length = 0
  vi.stubGlobal('Worker', FundWorker)
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
})
afterEach(() => {
  client.clear()
  vi.unstubAllGlobals()
})

describe('fund source background loading', () => {
  it('keeps the query pending until the worker returns validated data, including dates', async () => {
    const query = client.query(PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS)
    expect(
      client.getQueryData(PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS.queryKey),
    ).toBeUndefined()
    const data = makeFundHoldingsData({
      holdings: [makeFundHolding()],
      history: [historicalHolding()],
    })
    workers[0].onmessage?.(
      new MessageEvent('message', { data: structuredClone(data) }),
    )

    await expect(query).resolves.toEqual(data)
    expect(workers[0].terminate).toHaveBeenCalledOnce()
    expect(
      client.getQueryData(PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS.queryKey),
    ).toEqual(data)
  })

  it('propagates source validation failures without caching empty data', async () => {
    const query = client.query(PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS)
    workers[0].onmessage?.(
      new MessageEvent('message', {
        data: new Error('Invalid holding weight'),
      }),
    )

    await expect(query).rejects.toThrow('Invalid holding weight')
    expect(workers[0].terminate).toHaveBeenCalledOnce()
    expect(
      client.getQueryData(PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS.queryKey),
    ).toBeUndefined()
  })

  it('propagates worker startup failures and releases the worker', async () => {
    const query = client.query(PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS)
    workers[0].onerror?.({ message: 'Worker script unavailable' })

    await expect(query).rejects.toThrow('Worker script unavailable')
    expect(workers[0].terminate).toHaveBeenCalledOnce()
  })

  it('terminates background work when React Query cancels the request', async () => {
    const query = client
      .query(PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS)
      .catch((error: unknown) => error)
    await client.cancelQueries({
      queryKey: PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS.queryKey,
      exact: true,
    })

    await expect(query).resolves.toMatchObject({ name: 'Error' })
    expect(workers[0].terminate).toHaveBeenCalledOnce()
    expect(
      client.getQueryData(PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS.queryKey),
    ).toBeUndefined()
  })
})
