// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { clearCsvCache } from '@/shared/csv/csvData/clearCsvCache'

import { useGetFundDiagnosticsQuery } from './useGetFundDiagnosticsQuery'

const UNRESOLVED_CSV =
  'parent_id,parent_name,unresolved_id,unresolved_name,reason,path,weight,market_value,queued_for_research,detected_at\nFR0000000001,Fund,unknown,Unknown holding,missing_source,Fund > Unknown,0.2,20,False,2026-01-31\n'

function queryWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

function serveUnresolved(csv: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn<typeof fetch>(async (input) =>
      (input instanceof Request ? input.url : input.toString()).endsWith(
        'fund_unresolved.csv',
      )
        ? new Response(csv, { headers: { 'Content-Type': 'text/csv' } })
        : new Response(null, { status: 404 }),
    ),
  )
}

afterEach(() => {
  cleanup()
  clearCsvCache()
  vi.unstubAllGlobals()
})

describe('fund diagnostics sources', () => {
  it('starts independent requests together and tolerates absent optional sources', async () => {
    let releaseRequests!: () => void
    const pending = new Promise<void>((resolve) => {
      releaseRequests = resolve
    })
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => {
        await pending
        return new Response(null, { status: 404 })
      }),
    )
    const { result } = renderHook(useGetFundDiagnosticsQuery, {
      wrapper: queryWrapper(),
    })
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3))
    expect(result.current.isPending).toBe(true)
    await act(async () => {
      releaseRequests()
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({
      report: null,
      snapshots: [],
      unresolved: [],
    })
  })

  it('validates unresolved exposure numbers, flags and dates at the network boundary', async () => {
    serveUnresolved(UNRESOLVED_CSV)
    const { result } = renderHook(useGetFundDiagnosticsQuery, {
      wrapper: queryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({
      report: null,
      snapshots: [],
      unresolved: [
        {
          parentId: 'FR0000000001',
          parentName: 'Fund',
          unresolvedId: 'unknown',
          unresolvedName: 'Unknown holding',
          reason: 'missing_source',
          path: 'Fund > Unknown',
          weight: 0.2,
          marketValue: 20,
          queuedForResearch: false,
          detectedAt: new Date('2026-01-31'),
        },
      ],
    })
  })

  it.each([
    { name: 'boolean', csv: UNRESOLVED_CSV.replace('False', 'invalid') },
    { name: 'amount', csv: UNRESOLVED_CSV.replace(',20,', ',Infinity,') },
    { name: 'date', csv: UNRESOLVED_CSV.replace('2026-01-31', '2026-02-30') },
  ])(
    'rejects an invalid $name instead of exposing partial diagnostics',
    async ({ csv }) => {
      serveUnresolved(csv)
      const { result } = renderHook(useGetFundDiagnosticsQuery, {
        wrapper: queryWrapper(),
      })
      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.data).toBeUndefined()
    },
  )

  it.each([
    'fund_holdings_coverage.csv',
    'fund_snapshot_manifest.csv',
    'fund_unresolved.csv',
  ])('surfaces an HTTP failure from %s', async (filename) => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(
        async (input) =>
          new Response(null, {
            status: (input instanceof Request
              ? input.url
              : input.toString()
            ).endsWith(filename)
              ? 503
              : 404,
          }),
      ),
    )
    const { result } = renderHook(useGetFundDiagnosticsQuery, {
      wrapper: queryWrapper(),
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('HTTP 503')
  })
})
