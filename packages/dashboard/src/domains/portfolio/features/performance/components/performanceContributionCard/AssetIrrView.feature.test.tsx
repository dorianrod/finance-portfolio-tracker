import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { Provider } from 'jotai'
import { afterEach, describe, expect, it } from 'vitest'

import { assetIrr } from '@/domains/portfolio/features/performance/mocks/assetIrrSummary.mock'

import { AssetIrrView } from './AssetIrrView.feature'

afterEach(cleanup)

describe('AssetIrrView', () => {
  it('shows positive and negative rankings, values and the measured period', () => {
    render(
      <Provider>
        <QueryClientProvider client={new QueryClient()}>
          <AssetIrrView summary={assetIrr()} status="ready" />
        </QueryClientProvider>
      </Provider>,
    )
    expect(screen.queryByText('IRR method')).toBeNull()
    expect(screen.getByText('Assets measured')).toBeDefined()
    expect(
      screen.getAllByRole('button', { name: 'More information' }),
    ).toHaveLength(1)
    expect(screen.getByText('12 Oct 2025 – 12 Oct 2026')).toBeDefined()
    expect(screen.getByRole('heading', { name: 'Top IRRs' })).toBeDefined()
    expect(screen.getByRole('heading', { name: 'Lowest IRRs' })).toBeDefined()
    expect(screen.getByText('Winner')).toBeDefined()
    expect(screen.queryByText('WIN')).toBeNull()
    expect(screen.getByText('+20.00%')).toBeDefined()
    expect(screen.getByText('Value 1,200 €')).toBeDefined()
    expect(screen.getByText('Loser')).toBeDefined()
    expect(screen.queryByText('LOSE')).toBeNull()
    expect(screen.getByText('-10.00%')).toBeDefined()
    expect(screen.getByText('Value 900 €')).toBeDefined()
  })
  it.each([
    { status: 'loading', available: true, expected: 'Calculating asset IRR' },
    {
      status: 'error',
      available: true,
      expected: 'Asset IRR is not available',
    },
    {
      status: 'ready',
      available: false,
      expected: 'Asset IRR is not available',
    },
  ] as const)(
    'shows $status availability $available',
    ({ status, available, expected }) => {
      render(
        <Provider>
          <QueryClientProvider client={new QueryClient()}>
            <AssetIrrView summary={assetIrr({ available })} status={status} />
          </QueryClientProvider>
        </Provider>,
      )
      expect(screen.getByText(expected, { exact: false })).toBeDefined()
    },
  )
})
