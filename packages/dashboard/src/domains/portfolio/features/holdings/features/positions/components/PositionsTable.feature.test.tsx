// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createStore, Provider } from 'jotai'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { makeFundHoldingStatus } from '@/domains/portfolio/shared/mocks/fundHoldingStatus.mock'
import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'
import { clearCsvCache } from '@/shared/csv/csvData'

import { PositionsTable } from './PositionsTable.feature'

function renderTable() {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () => new Response('', { headers: { 'Content-Type': 'text/csv' } }),
    ),
  )
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  const store = createStore()
  render(
    <QueryClientProvider client={client}>
      <Provider store={store}>
        <PositionsTable
          data={[makePosition()]}
          fundStatuses={[makeFundHoldingStatus()]}
        />
      </Provider>
    </QueryClientProvider>,
  )
  return client
}

afterEach(() => {
  cleanup()
  clearCsvCache()
  vi.unstubAllGlobals()
})

describe('PositionsTable keyboard focus', () => {
  it('keeps the sort button focused after changing the sort', async () => {
    const user = userEvent.setup()
    const client = renderTable()
    await waitFor(() => expect(client.isFetching()).toBe(0))
    const button = screen.getByRole('button', { name: /Current value/ })
    await user.click(button)
    expect(document.activeElement).toBe(button)
    await user.keyboard('{Enter}')
    expect(document.activeElement).toBe(button)
  })

  it('keeps the composition trigger mounted and focused while its popover opens', async () => {
    const user = userEvent.setup()
    const client = renderTable()
    await waitFor(() => expect(client.isFetching()).toBe(0))
    const button = screen.getByRole('button', {
      name: /for Asset\. Show composition/,
    })
    await user.click(button)
    expect(document.activeElement).toBe(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('button', { name: /^Open all/ })).toBeTruthy()
  })
})
