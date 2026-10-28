// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { makeFundHoldingStatus } from '@/domains/portfolio/shared/mocks/fundHoldingStatus.mock'
import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'
import { clearCsvCache } from '@/shared/csv/csvData/clearCsvCache'

import { PositionsTable } from './PositionsTable.feature'

afterEach(() => {
  cleanup()
  clearCsvCache()
  vi.unstubAllGlobals()
})

describe('PositionsTable previews', () => {
  it('updates an open composition preview when the source status changes', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(
        async () =>
          new Response('', {
            headers: { 'Content-Type': 'text/csv' },
          }),
      ),
    )
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    const store = createStore()
    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={client}>
          <Provider store={store}>{children}</Provider>
        </QueryClientProvider>
      )
    }
    const data = [makePosition()]
    const status = makeFundHoldingStatus({ sourceName: 'Original source' })
    const { rerender } = render(
      <PositionsTable data={data} fundStatuses={[status]} />,
      { wrapper: Wrapper },
    )

    await user.hover(screen.getByRole('button', { name: /Show composition/ }))
    const preview = await screen.findByRole('dialog', { name: 'Asset' })
    expect(within(preview).getByText('Original source')).toBeTruthy()

    rerender(
      <PositionsTable
        data={data}
        fundStatuses={[{ ...status, sourceName: 'Updated source' }]}
      />,
    )
    expect(within(preview).getByText('Updated source')).toBeTruthy()
    expect(within(preview).queryByText('Original source')).toBeNull()
  })
})
