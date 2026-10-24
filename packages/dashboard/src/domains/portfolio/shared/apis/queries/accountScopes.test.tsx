// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useAccountTypeHistory } from '@/domains/portfolio/shared/services/useAccountTypeHistory'
import { clearCsvCache } from '@/shared/csv/csvData'

import { usePassiveIncomeQuery } from './usePassiveIncomeQuery'
import { useSavingCapacityQuery } from './useSavingCapacityQuery'

function queryWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
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

function csv(text: string) {
  return new Response(text, { headers: { 'Content-Type': 'text/csv' } })
}

describe('account-scoped queries', () => {
  it('preserves commas in passive-income account names and distinguishes cache scopes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        csv(
          'date,account,isin,ticker,name,operation_type,quantity,price_per_unit,total_amount,currency,realized_gain\n2026-01-01,"A,B",,,Fund,DIVIDEND,0,0,42,EUR,0\n2026-01-01,A,,,Fund,DIVIDEND,0,0,10,EUR,0\n',
        ),
      ),
    )
    const { result, rerender } = renderHook(
      ({ accounts }) => usePassiveIncomeQuery(accounts),
      {
        initialProps: { accounts: new Set(['A,B']) },
        wrapper: queryWrapper(),
      },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([
      { year: 2026, dividends: 42, interest: 0 },
    ])
    rerender({ accounts: new Set(['A', 'B']) })
    await waitFor(() =>
      expect(result.current.data).toEqual([
        { year: 2026, dividends: 10, interest: 0 },
      ]),
    )
  })

  it('preserves commas in savings account names', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        csv(
          'snapshot_date,account,savings_delta,perf_delta\n2026-01-31,"A,B",42,2\n2026-01-31,A,10,1\n',
        ),
      ),
    )
    const { result } = renderHook(
      () => useSavingCapacityQuery(new Set(['A,B'])),
      {
        wrapper: queryWrapper(),
      },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([
      { date: new Date('2026-01-31'), savings_delta: 42, perf_delta: 2 },
    ])
  })

  it('preserves commas when aggregating account types', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        csv(
          'snapshot_date,account,account_type,account_category,isin,ticker,name,total_value\n2026-01-31,"A,B",PEA,investment,,,Fund,42\n2026-01-31,A,PEA,investment,,,Fund,10\n',
        ),
      ),
    )
    const { result } = renderHook(
      () => useAccountTypeHistory(new Set(['A,B'])),
      {
        wrapper: queryWrapper(),
      },
    )
    await waitFor(() =>
      expect(result.current.data).toEqual([
        { date: new Date('2026-01-31'), PEA: 42 },
      ]),
    )
  })
})
