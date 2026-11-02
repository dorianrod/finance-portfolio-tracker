import { QueryClient } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { clearCsvCache } from '@/shared/csv/csvData/clearCsvCache'

import { PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS } from './portfolioFundHoldingsQueryOptions'
afterEach(() => {
  clearCsvCache()
  vi.unstubAllGlobals()
})
describe('portfolioFundHoldingsQueryOptions', () => {
  it('defaults absent optional files without losing their source distinction', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 404 })),
    )
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    await expect(
      client.query(PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS),
    ).resolves.toEqual({ holdings: [], history: [], statuses: [] })
    client.clear()
  })
  it('rejects an unavailable fund source instead of treating it as an absent optional file', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 503 })),
    )
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    await expect(
      client.query(PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS),
    ).rejects.toThrow('503')
    client.clear()
  })
})
