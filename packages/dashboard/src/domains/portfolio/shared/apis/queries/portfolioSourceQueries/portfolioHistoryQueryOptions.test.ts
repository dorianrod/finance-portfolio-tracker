import { QueryClient } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { clearCsvCache } from '@/shared/csv/csvData/clearCsvCache'

import { PORTFOLIO_HISTORY_QUERY_OPTIONS } from './portfolioHistoryQueryOptions'

afterEach(() => {
  clearCsvCache()
  vi.unstubAllGlobals()
})

describe('portfolioHistoryQueryOptions', () => {
  it('validates and normalizes the shared source', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            'snapshot_date,total_value,total_cost_basis,unrealized_gain,net_cash_injected,cash_delta,tri,tri_rolling_1y,tri_rolling_3y\n2026-01-31,1200,1000,200,1000,10,8,7,6\n',
            { headers: { 'Content-Type': 'text/csv' } },
          ),
      ),
    )
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    const data = await client.query(PORTFOLIO_HISTORY_QUERY_OPTIONS)
    expect(data[0]).toMatchObject({
      date: new Date('2026-01-31'),
      total_value: 1200,
      tri: 8,
    })
    client.clear()
  })
  it('rejects invalid financial source data before it reaches the cache', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response('snapshot_date,total_value\n2026-02-30,invalid\n', {
            headers: { 'Content-Type': 'text/csv' },
          }),
      ),
    )
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    await expect(
      client.query(PORTFOLIO_HISTORY_QUERY_OPTIONS),
    ).rejects.toMatchObject({ name: 'ValidationError' })
    expect(
      client.getQueryData(PORTFOLIO_HISTORY_QUERY_OPTIONS.queryKey),
    ).toBeUndefined()
    client.clear()
  })
})
