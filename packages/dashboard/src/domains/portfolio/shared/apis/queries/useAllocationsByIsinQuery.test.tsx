// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { clearCsvCache } from '@/shared/csv/csvData'

import { useAllocationsByIsinQuery } from './useAllocationsByIsinQuery'

afterEach(() => {
  cleanup()
  clearCsvCache()
  vi.unstubAllGlobals()
})

function wrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, gcTime: 0 },
    },
  })
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

describe('useAllocationsByIsinQuery', () => {
  it('fetches real data despite the empty placeholder and infinite freshness', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          'snapshot_date,account,account_type,isin,name,france,nc\n2026-01-31,A,PEA,FR1,Fund,100,10\n2026-01-31,B,CTO,FR1,Fund,50,5\n',
          { headers: { 'Content-Type': 'text/csv' } },
        ),
    )
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(useAllocationsByIsinQuery, {
      wrapper: wrapper(),
    })
    await waitFor(() =>
      expect(result.current.data?.get('FR1')?.geo).toEqual({
        date: new Date('2026-01-31'),
        categories: [
          { name: 'france', value: 150 },
          { name: 'nc', value: 15 },
        ],
      }),
    )
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })
})
