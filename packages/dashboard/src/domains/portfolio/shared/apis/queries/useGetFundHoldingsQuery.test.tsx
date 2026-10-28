// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { clearCsvCache } from '@/shared/csv/csvData/clearCsvCache'

import { useGetFundHoldingsQuery } from './useGetFundHoldingsQuery'

const HOLDING_CSV =
  'parent_isin,parent_ticker,parent_name,holding_id,holding_name,weight,holdings_date,depth\n FR0000000001 ,ETF, Example Fund ,US0000000001, Example Company ,0.5,2026-09-30,1\n'

function queryWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

function serveHoldings(csv: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn<typeof fetch>(async (input) =>
      (input instanceof Request ? input.url : input.toString()).endsWith(
        '/fund_holdings.csv',
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

describe('useGetFundHoldingsQuery', () => {
  it('normalizes holdings at the schema boundary and defaults absent optional files', async () => {
    serveHoldings(HOLDING_CSV)
    const { result } = renderHook(useGetFundHoldingsQuery, {
      wrapper: queryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({
      holdings: [
        {
          parentIsin: 'FR0000000001',
          parentTicker: 'ETF',
          parentName: 'Example Fund',
          holdingId: 'US0000000001',
          holdingName: 'Example Company',
          issuerId: 'US0000000001',
          issuerName: 'Example Company',
          weight: 0.5,
          holdingsDate: new Date('2026-09-30'),
          depth: 1,
          sourceTier: '',
          sourceName: '',
          holdingKind: 'security',
          lookthroughPath: '',
          snapshotId: '',
          sourceOrigin: 'deterministic',
          sourceUrl: '',
        },
      ],
      history: [],
      statuses: [],
    })
  })

  it.each([
    ['holding identity', HOLDING_CSV.replace('US0000000001', '')],
    ['weight', HOLDING_CSV.replace('0.5', 'Infinity')],
    ['negative infinite weight', HOLDING_CSV.replace('0.5', '-Infinity')],
    ['depth', HOLDING_CSV.replace(',1\n', ',Infinity\n')],
    ['calendar date', HOLDING_CSV.replace('2026-09-30', '2026-02-30')],
  ])(
    'rejects invalid %s without exposing partial financial data',
    async (_field, csv) => {
      serveHoldings(csv)
      const { result } = renderHook(useGetFundHoldingsQuery, {
        wrapper: queryWrapper(),
      })
      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.data).toBeUndefined()
    },
  )
})
