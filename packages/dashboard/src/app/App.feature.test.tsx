// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createStore, Provider } from 'jotai'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'
import { clearCsvCache } from '@/shared/csv/csvData/clearCsvCache'

import App from './App.feature'

afterEach(() => {
  cleanup()
  clearCsvCache()
  vi.unstubAllGlobals()
})

describe('dashboard loading controls', () => {
  it('starts every independent source while all responses are still pending', async () => {
    const pending = new Promise<Response>(() => {})
    const fetchMock = vi.fn<typeof fetch>(() => pending)
    vi.stubGlobal('fetch', fetchMock)
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    render(
      <QueryClientProvider client={client}>
        <Provider store={createStore()}>
          <App />
        </Provider>
      </QueryClientProvider>,
    )
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
    expect(
      screen.getByRole('navigation', { name: 'Portfolio analyses' }),
    ).toBeTruthy()
    client.clear()
  })

  it('keeps navigation and an open filter panel usable when a source fails', async () => {
    const user = userEvent.setup()
    let completeRequest!: (response: Response) => void
    const pendingResponse = new Promise<Response>((resolve) => {
      completeRequest = resolve
    })
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) =>
        (input instanceof Request ? input.url : input.toString()).endsWith(
          'portfolio_history.csv',
        )
          ? pendingResponse
          : new Response('', { headers: { 'Content-Type': 'text/csv' } }),
      ),
    )
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    const store = createStore()
    render(
      <QueryClientProvider client={client}>
        <Provider store={store}>
          <App />
        </Provider>
      </QueryClientProvider>,
    )

    expect(
      screen.getByRole('navigation', { name: 'Portfolio analyses' }),
    ).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Filters' }))
    const field = screen.getByLabelText('Period start')
    await user.type(field, '2026-01-01')

    await act(async () => {
      completeRequest(new Response(null, { status: 503 }))
    })
    await waitFor(() =>
      expect(screen.getByRole('alert', { hidden: true }).textContent).toContain(
        '503',
      ),
    )
    expect(screen.getByLabelText('Period start')).toBe(field)
    expect(field).toHaveProperty('value', '2026-01-01')
    expect(document.activeElement).toBe(field)
    expect(store.get(dashboardFiltersAtom).dateFrom).toEqual(
      new Date('2026-01-01'),
    )

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(
      screen.getByRole('navigation', { name: 'Portfolio analyses' }),
    ).toBeTruthy()
    expect(screen.getByRole('button', { name: /Filters/ })).toBeTruthy()
  })
})
