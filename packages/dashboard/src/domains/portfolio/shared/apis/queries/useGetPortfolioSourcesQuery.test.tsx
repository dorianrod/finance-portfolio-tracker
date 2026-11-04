// @vitest-environment jsdom
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { Suspense } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DashboardSourceBoundary } from '@/app/DashboardSourceBoundary.view'
import { createDashboardTestContext } from '@/app/mocks/dashboardTestContext.mock'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { clearCsvCache } from '@/shared/csv/csvData/clearCsvCache'

import { useGetPortfolioSourcesQuery } from './useGetPortfolioSourcesQuery'
afterEach(() => {
  cleanup()
  clearCsvCache()
  vi.unstubAllGlobals()
})
describe('useGetPortfolioSourcesQuery', () => {
  it('reuses validated sources across shell startup and independently mounted capabilities', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { client, data, wrapper } = createDashboardTestContext()
    const { result } = renderHook(useGetPortfolioSourcesQuery, { wrapper })
    expect(result.current[1]?.data).toEqual(data.history)
    expect(fetchMock).not.toHaveBeenCalled()
    client.clear()
  })
  it('leaves the original HTTP failure visible to the persistent shell', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 503 })),
    )
    const { client, wrapper: Wrapper } = createDashboardTestContext(false)
    function Boundary({ children }: PropsWithChildren) {
      return (
        <Wrapper>
          <DashboardSourceBoundary>
            <Suspense fallback={null}>{children}</Suspense>
          </DashboardSourceBoundary>
        </Wrapper>
      )
    }
    renderHook(useGetPortfolioSourcesQuery, { wrapper: Boundary })
    await waitFor(() =>
      expect(
        client.getQueryState(portfolioQueryKeys.data('portfolio-history'))
          ?.error?.message,
      ).toContain('503'),
    )
    expect(
      client.getQueryData(portfolioQueryKeys.data('portfolio-history')),
    ).toBeUndefined()
    client.clear()
  })
})
