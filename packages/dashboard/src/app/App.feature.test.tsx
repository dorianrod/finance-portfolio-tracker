// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createStore, Provider } from 'jotai'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFiltersAtom'
import { clearCsvCache } from '@/shared/csv/csvData/clearCsvCache'

import App from './App.feature'

afterEach(() => {
  cleanup()
  clearCsvCache()
  vi.unstubAllGlobals()
})

describe('dashboard loading controls', () => {
  it('keeps navigation and an open filter panel usable when a source fails', async () => {
    const user = userEvent.setup()
    let completeRequest!: (response: Response) => void
    const pendingResponse = new Promise<Response>((resolve) => {
      completeRequest = resolve
    })
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) =>
        String(input).endsWith('portfolio_history.csv')
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
