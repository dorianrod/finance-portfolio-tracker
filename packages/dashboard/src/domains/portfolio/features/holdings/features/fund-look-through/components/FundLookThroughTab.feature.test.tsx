// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { makeIssuerPosition } from '@/domains/portfolio/features/holdings/features/fund-look-through/mocks/issuerPosition.mock'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import { clearCsvCache } from '@/shared/csv/csvData/clearCsvCache'

import { FundLookThroughTab } from './FundLookThroughTab.feature'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn<typeof fetch>(async () => new Response(null, {status: 404})))
})

afterEach(() => {
  cleanup()
  clearCsvCache()
  vi.unstubAllGlobals()
})

function renderTab(positions: PositionRow[]) {
  const client = new QueryClient({defaultOptions: {queries: {retry: false, gcTime: 0}}})
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
    renderTab([makeIssuerPosition({isin: 'US0000000001', name: 'Example Company', total_value: 100})])

    expect(screen.getByRole('searchbox', {name: 'Search underlying exposure'})).toBeTruthy()
    expect(screen.getByText('1 issuer')).toBeTruthy()
  })

  it('keeps an unavailable notice for an unresolved fund', () => {
    renderTab([makeIssuerPosition({isin: 'FR0000000001', name: 'Example ETF', total_value: 100})])

    expect(screen.getByRole('heading', {name: 'No identified underlying exposure yet'})).toBeTruthy()
    expect(screen.queryByRole('searchbox')).toBeNull()
  })
})
