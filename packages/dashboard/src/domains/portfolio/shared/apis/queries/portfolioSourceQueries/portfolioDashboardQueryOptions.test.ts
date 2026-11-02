import { QueryClient } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { clearCsvCache } from '@/shared/csv/csvData/clearCsvCache'

import { getPortfolioDashboardQueryOptions } from './portfolioDashboardQueryOptions'
afterEach(() => {
  clearCsvCache()
  vi.unstubAllGlobals()
})
describe('portfolioDashboardQueryOptions', () => {
  it('reuses the already validated operation and position sources', async () => {
    const fetchMock = vi.fn(
      async () => new Response('', { headers: { 'Content-Type': 'text/csv' } }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    client.setQueryData(portfolioQueryKeys.data('operations'), [])
    client.setQueryData(portfolioQueryKeys.data('all-positions'), [])
    await expect(
      client.query(getPortfolioDashboardQueryOptions(client)),
    ).resolves.toEqual({
      positions: [],
      rawPositions: [],
      rawOperations: [],
      accountLabels: {},
    })
    expect(fetchMock).toHaveBeenCalledOnce()
    client.clear()
  })
  it('rejects an unavailable required account source', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 503 })),
    )
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    await expect(
      client.query(getPortfolioDashboardQueryOptions(client)),
    ).rejects.toThrow('503')
    expect(
      client.getQueryData(portfolioQueryKeys.data('dashboard')),
    ).toBeUndefined()
    client.clear()
  })
})
