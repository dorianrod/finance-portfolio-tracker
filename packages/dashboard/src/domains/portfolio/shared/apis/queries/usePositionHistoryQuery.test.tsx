// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { clearCsvCache } from '@/shared/csv/csvData'

import { usePositionHistoryQuery } from './usePositionHistoryQuery'
import { usePositionsQuery } from './usePositionsQuery'

function queryWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

afterEach(() => {
  cleanup()
  clearCsvCache()
  vi.unstubAllGlobals()
})

describe('usePositionHistoryQuery', () => {
  it('reuses validated positions already loaded by the dashboard when opening a detail', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          'snapshot_date,account,account_type,account_category,isin,ticker,name,total_value,avg_buy_price,quantity,last_price\n2026-01-31,A,PEA,investment,FR1,FUND,Fund,120,100,1,120\n',
          { headers: { 'Content-Type': 'text/csv' } },
        ),
    )
    vi.stubGlobal('fetch', fetchMock)
    const wrapper = queryWrapper()
    const positions = renderHook(usePositionsQuery, { wrapper })
    await waitFor(() => expect(positions.result.current.isSuccess).toBe(true))
    const { result, rerender } = renderHook(
      ({ isin }) => usePositionHistoryQuery(isin),
      {
        wrapper,
        initialProps: { isin: 'FR1' },
      },
    )
    await waitFor(() =>
      expect(result.current.data).toEqual([
        {
          date: new Date('2026-01-31'),
          value: 120,
          costBasis: 100,
          last_price: 120,
          pct: null,
        },
      ]),
    )
    rerender({ isin: 'unknown' })
    await waitFor(() => expect(result.current.data).toBeNull())
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('surfaces invalid source data instead of caching an empty history', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            'snapshot_date,account,account_type,account_category,isin,ticker,name,total_value\n2026-01-31,A,PEA,investment,FR1,FUND,Fund,invalid\n',
            { headers: { 'Content-Type': 'text/csv' } },
          ),
      ),
    )
    const { result } = renderHook(() => usePositionHistoryQuery('FR1'), {
      wrapper: queryWrapper(),
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ name: 'ValidationError' })
  })

  it('does not fetch a history without a selected position', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    renderHook(() => usePositionHistoryQuery(null), { wrapper: queryWrapper() })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
