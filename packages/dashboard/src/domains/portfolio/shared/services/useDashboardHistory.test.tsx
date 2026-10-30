// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { resetFilters } from '@/domains/portfolio/features/scope-selection/helpers/transformers/resetFilters'
import { makePortfolioHistoryResponse } from '@/domains/portfolio/shared/mocks/portfolioHistoryResponse.mock'

import { useDashboardHistory } from './useDashboardHistory'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function queryWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

describe('filtered dashboard history', () => {
  it.each([
    { status: 200, expectedStatus: 'ready', expectedIrr: 24 },
    { status: 503, expectedStatus: 'error', expectedIrr: null },
  ])(
    'does not relabel the previous account IRR while the next request resolves with HTTP $status',
    async ({ status, expectedStatus, expectedIrr }) => {
      let completeRequest!: (response: Response) => void
      const pendingResponse = new Promise<Response>((resolve) => {
        completeRequest = resolve
      })
      const first = makePortfolioHistoryResponse({ accounts: ['first'] })
      const second = makePortfolioHistoryResponse({
        accounts: ['second'],
        history: first.history.map((point) => ({ ...point, tri: 24 })),
      })
      vi.stubGlobal(
        'fetch',
        vi
          .fn<typeof fetch>()
          .mockResolvedValueOnce(Response.json(first))
          .mockReturnValueOnce(pendingResponse),
      )
      const { result, rerender } = renderHook(
        ({ accounts }) =>
          useDashboardHistory({
            allAccounts: ['first', 'second'],
            allPositionRows: [],
            enrichedHistory: [],
            filters: { ...resetFilters(), accounts },
          }),
        {
          initialProps: { accounts: new Set(['first']) },
          wrapper: queryWrapper(),
        },
      )

      await waitFor(() => expect(result.current.globalTri).toBe(12))
      rerender({ accounts: new Set(['second']) })
      expect(result.current.irrStatus).toBe('loading')
      expect(result.current.globalTri).toBeNull()

      await act(async () => {
        completeRequest(Response.json(second, { status }))
      })
      await waitFor(() => expect(result.current.irrStatus).toBe(expectedStatus))
      expect(result.current.globalTri).toBe(expectedIrr)
    },
  )
})
