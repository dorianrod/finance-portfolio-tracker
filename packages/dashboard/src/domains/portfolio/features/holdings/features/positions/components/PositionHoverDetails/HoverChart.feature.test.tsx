// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { clearCsvCache } from '@/shared/csv/csvData/clearCsvCache'
import { Preview } from '@/shared/ui/Preview.view'

import { HoverChart } from './HoverChart.feature'
import { HoverSavingsChart } from './HoverSavingsChart.feature'

afterEach(() => {
  cleanup()
  clearCsvCache()
  vi.unstubAllGlobals()
})

describe.each([
  {
    name: 'position',
    Chart: HoverChart,
    target: {
      isin: 'FR1',
      name: 'Fund',
      operations: [],
      buttonRect: new DOMRect(),
    },
  },
  {
    name: 'savings',
    Chart: HoverSavingsChart,
    target: {
      isin: 'FR1',
      name: 'Savings',
      operations: [],
      buttonRect: new DOMRect(),
    },
  },
])('$name history overlay', ({ Chart, target }) => {
  it('replaces the loading message with an error after a failed request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 503 })),
    )
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity } },
    })
    render(
      <QueryClientProvider client={client}>
        <Preview open onOpenChange={vi.fn()}>
          <Chart
            target={target}
            onMouseEnter={vi.fn()}
            onMouseLeave={vi.fn()}
          />
        </Preview>
      </QueryClientProvider>,
    )
    expect(screen.getByRole('status').textContent).toBe('Loading…')
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('HTTP 503'),
    )
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('shows an explicit empty state when no position history is available', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response('', { headers: { 'Content-Type': 'text/csv' } }),
      ),
    )
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity } },
    })
    render(
      <QueryClientProvider client={client}>
        <Preview open onOpenChange={vi.fn()}>
          <Chart
            target={target}
            onMouseEnter={vi.fn()}
            onMouseLeave={vi.fn()}
          />
        </Preview>
      </QueryClientProvider>,
    )
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toBe(
        'No history is available for this position.',
      ),
    )
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
