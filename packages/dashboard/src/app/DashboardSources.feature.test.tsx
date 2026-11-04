// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { clearCsvCache } from '@/shared/csv/csvData/clearCsvCache'

import { DashboardSources } from './DashboardSources.feature'

const clients: QueryClient[] = []
afterEach(() => {
  cleanup()
  clients.splice(0).forEach((client) => client.clear())
  clearCsvCache()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})
function mountSources() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  clients.push(client)
  render(
    <QueryClientProvider client={client}>
      <span>Persistent shell</span>
      <DashboardSources />
    </QueryClientProvider>,
  )
  return client
}

describe('DashboardSources', () => {
  it('starts independent transports before any source resolves', async () => {
    const fetchMock = vi.fn<typeof fetch>(() => new Promise<Response>(() => {}))
    vi.stubGlobal('fetch', fetchMock)
    mountSources()
    const data = PORTFOLIO_ENDPOINTS.data
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.map(([input]) =>
          input instanceof Request ? input.url : input.toString(),
        ),
      ).toEqual(
        expect.arrayContaining([
          data.accounts,
          data.operations,
          data.positions,
          data.portfolioHistory,
          data.errors,
          data.manualPriceOverrides,
          data.positionsGeoByIsin,
          data.positionsSecteurByIsin,
          data.positionsCurrencyByIsin,
          data.positionsClasseByIsin,
          data.fundHoldings,
          data.fundHoldingsHistory,
          data.fundHoldingsStatus,
          data.fundHoldingsCoverage,
          data.fundSnapshotManifest,
          data.fundUnresolved,
          data.annualIncomeSavings,
        ]),
      ),
    )
  })
  it('keeps source errors observable in cache without removing the shell', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => new Response('', { status: 503 })),
    )
    const client = mountSources()
    await waitFor(() =>
      expect(
        client.getQueryState(portfolioQueryKeys.data('portfolio-history'))
          ?.status,
      ).toBe('error'),
    )
    expect(screen.getByText('Persistent shell')).toBeDefined()
  })
})
