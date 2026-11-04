import { QueryClient } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { clearCsvCache } from '@/shared/csv/csvData/clearCsvCache'

import { PORTFOLIO_PIPELINE_ERRORS_QUERY_OPTIONS } from './portfolioPipelineErrorsQueryOptions'

afterEach(() => {
  clearCsvCache()
  vi.unstubAllGlobals()
})

describe('portfolioPipelineErrorsQueryOptions', () => {
  it('validates and normalizes the shared source', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            'source,level,type,date,account,isin,ticker,name,message\nprices,error,missing,2026-01-31,A,FR1,TICKER,Asset,Missing price\n',
            { headers: { 'Content-Type': 'text/csv' } },
          ),
      ),
    )
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    const data = await client.query(PORTFOLIO_PIPELINE_ERRORS_QUERY_OPTIONS)
    expect(data[0]).toMatchObject({
      level: 'error',
      date: new Date('2026-01-31'),
      message: 'Missing price',
    })
    client.clear()
  })
  it('rejects invalid financial source data before it reaches the cache', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            'source,level,type,date,account,isin,ticker,name,message\nprices,error,missing,2026-02-30,A,FR1,TICKER,Asset,Missing price\n',
            { headers: { 'Content-Type': 'text/csv' } },
          ),
      ),
    )
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    await expect(
      client.query(PORTFOLIO_PIPELINE_ERRORS_QUERY_OPTIONS),
    ).rejects.toMatchObject({ name: 'ValidationError' })
    expect(
      client.getQueryData(PORTFOLIO_PIPELINE_ERRORS_QUERY_OPTIONS.queryKey),
    ).toBeUndefined()
    client.clear()
  })
})
