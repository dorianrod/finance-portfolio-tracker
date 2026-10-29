// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createStore, Provider } from 'jotai'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { makeIssuerPosition } from '@/domains/portfolio/features/holdings/features/fund-look-through/mocks/issuerPosition.mock'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import { clearCsvCache } from '@/shared/csv/csvData/clearCsvCache'

import { FundLookThroughTab } from './FundLookThroughTab.feature'

beforeEach(() => {
  vi.stubGlobal('scrollTo', vi.fn())
  vi.stubGlobal(
    'fetch',
    vi.fn<typeof fetch>(async () => new Response(null, { status: 404 })),
  )
})

afterEach(() => {
  cleanup()
  clearCsvCache()
  vi.unstubAllGlobals()
})

function renderTab(positions: PositionRow[]) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  render(
    <QueryClientProvider client={client}>
      <Provider store={createStore()}>
        <FundLookThroughTab positions={positions} holdings={[]} />
      </Provider>
    </QueryClientProvider>,
  )
}

describe('underlying exposure without fund compositions', () => {
  it('shows identifiable direct holdings when no fund file is available', () => {
    renderTab([
      makeIssuerPosition({
        isin: 'US0000000001',
        name: 'Example Company',
        total_value: 100,
      }),
    ])

    expect(
      screen.getByRole('searchbox', { name: 'Search underlying exposure' }),
    ).toBeTruthy()
    expect(screen.getByText('1 issuer · 1 security')).toBeTruthy()
  })

  it('keeps an unavailable notice for an unresolved fund', () => {
    renderTab([
      makeIssuerPosition({
        isin: 'FR0000000001',
        name: 'Example ETF',
        total_value: 100,
      }),
    ])

    expect(
      screen.getByRole('heading', {
        name: 'No identified underlying exposure yet',
      }),
    ).toBeTruthy()
    expect(screen.queryByRole('searchbox')).toBeNull()
  })

  it('keeps the explorer available when a search matches no issuer', async () => {
    const user = userEvent.setup()
    renderTab([
      makeIssuerPosition({
        isin: 'US0000000001',
        name: 'Example Company',
        total_value: 100,
      }),
    ])

    await user.type(
      screen.getByRole('searchbox', { name: 'Search underlying exposure' }),
      'Unknown issuer',
    )

    expect(
      screen.getByRole('searchbox', { name: 'Search underlying exposure' }),
    ).toBeTruthy()
    expect(screen.getByText('No exposure matches this search.')).toBeTruthy()
    expect(
      screen.queryByRole('heading', {
        name: 'No identified underlying exposure yet',
      }),
    ).toBeNull()
  })

  it.each([
    { name: 'empty portfolio', positions: [] },
    {
      name: 'savings account',
      positions: [
        makeIssuerPosition({ account_category: 'savings', total_value: 100 }),
      ],
    },
    {
      name: 'unvalued position',
      positions: [makeIssuerPosition({ isin: 'US0000000001', total_value: 0 })],
    },
  ])('shows inapplicability for $name', ({ positions }) => {
    renderTab(positions)

    expect(
      screen.getByRole('heading', {
        name: 'Underlying exposure not applicable',
      }),
    ).toBeTruthy()
    expect(screen.queryByRole('searchbox')).toBeNull()
  })
})
