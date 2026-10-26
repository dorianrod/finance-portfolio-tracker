// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { clearCsvCache } from '@/shared/csv/csvData/clearCsvCache'

import { useDashboardViewModel } from './useDashboardViewModel'

afterEach(() => {
  cleanup()
  clearCsvCache()
  vi.unstubAllGlobals()
})

describe('dashboard data availability', () => {
  it.each([
    'portfolio_history.csv',
    'errors.csv',
    'positions_geo_by_isin.csv',
    'fund_holdings.csv',
  ])(
    'surfaces a failed %s instead of displaying empty data as valid',
    async (filename) => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async (input: string) =>
          input.endsWith(filename)
            ? new Response('', { status: 503 })
            : new Response('', { headers: { 'Content-Type': 'text/csv' } }),
        ),
      )
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      })
      const store = createStore()
      function Wrapper({ children }: PropsWithChildren) {
        return (
          <QueryClientProvider client={client}>
            <Provider store={store}>{children}</Provider>
          </QueryClientProvider>
        )
      }
      const { result } = renderHook(useDashboardViewModel, { wrapper: Wrapper })
      await waitFor(() => expect(result.current.error).toContain('HTTP 503'))
      expect(result.current.loading).toBe(false)
    },
  )
})
