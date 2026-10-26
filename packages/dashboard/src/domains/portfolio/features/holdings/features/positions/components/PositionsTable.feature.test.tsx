// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createStore, Provider } from 'jotai'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'
import { clearCsvCache } from '@/shared/csv/csvData'

import { PositionsTable } from './PositionsTable.feature'

const position = makePosition({
  name: 'Example ETF',
  subRows: [
    {
      kind: 'group',
      id: 'trades',
      groupType: 'trades',
      label: 'Buys / Sells',
      total_invested: 1000,
      subRows: [
        {
          kind: 'operation',
          id: 'buy',
          date: new Date('2026-01-31'),
          account: 'broker',
          operation_type: 'BUY',
          quantity: 10,
          price_per_unit: 100,
          total_amount: -1000,
          realized_gain: 0,
        },
      ],
    },
  ],
})

function renderPositions() {
  vi.stubGlobal(
    'fetch',
    vi.fn<typeof fetch>(
      async () =>
        new Response(
          'snapshot_date,isin,name,Europe\n2026-10-01,FR0000000001,Example ETF,100\n',
          { headers: { 'Content-Type': 'text/csv' } },
        ),
    ),
  )
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  render(
    <QueryClientProvider client={client}>
      <Provider store={createStore()}>
        <PositionsTable data={[position]} grouping="account-type" />
      </Provider>
    </QueryClientProvider>,
  )
}

afterEach(() => {
  cleanup()
  clearCsvCache()
  vi.unstubAllGlobals()
})

describe('PositionsTable', () => {
  it('expands and collapses transaction groups through the table controls', async () => {
    const user = userEvent.setup()
    renderPositions()
    expect(screen.getByText('Example ETF')).toBeTruthy()
    expect(screen.queryByText('Buys / Sells')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Expand all' }))
    expect(screen.getByText('Buys / Sells')).toBeTruthy()
    expect(screen.getByText('BUY')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Collapse all' }))
    expect(screen.queryByText('Buys / Sells')).toBeNull()
    expect(screen.queryByText('BUY')).toBeNull()
  })

  it('updates column actions when allocation data arrives from the network', async () => {
    renderPositions()
    expect(
      await screen.findByRole('button', {
        name: 'View allocations for Example ETF',
      }),
    ).toBeTruthy()
  })
})
