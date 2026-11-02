import { QueryClient } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { clearCsvCache } from '@/shared/csv/csvData/clearCsvCache'

import { PORTFOLIO_MANUAL_PRICE_OVERRIDES_QUERY_OPTIONS } from './portfolioManualPriceOverridesQueryOptions'

afterEach(() => {
  clearCsvCache()
  vi.unstubAllGlobals()
})

describe('portfolioManualPriceOverridesQueryOptions', () => {
  it('validates and normalizes the shared source', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            'name,ticker,isin,price,currency,date_from,date_to,source_file\nAsset,TICKER,FR1,42,usd,2026-01-01,,prices.csv\n',
            { headers: { 'Content-Type': 'text/csv' } },
          ),
      ),
    )
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    const data = await client.query(
      PORTFOLIO_MANUAL_PRICE_OVERRIDES_QUERY_OPTIONS,
    )
    expect(data[0]).toMatchObject({ price: 42, currency: 'USD', date_to: null })
    client.clear()
  })
  it('rejects invalid financial source data before it reaches the cache', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            'name,ticker,isin,price,currency,date_from,date_to,source_file\nAsset,TICKER,FR1,Infinity,USD,2026-01-01,,prices.csv\n',
            { headers: { 'Content-Type': 'text/csv' } },
          ),
      ),
    )
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    await expect(
      client.query(PORTFOLIO_MANUAL_PRICE_OVERRIDES_QUERY_OPTIONS),
    ).rejects.toMatchObject({ name: 'ValidationError' })
    expect(
      client.getQueryData(
        PORTFOLIO_MANUAL_PRICE_OVERRIDES_QUERY_OPTIONS.queryKey,
      ),
    ).toBeUndefined()
    client.clear()
  })
})
