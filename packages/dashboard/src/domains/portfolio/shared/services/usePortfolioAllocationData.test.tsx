// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { createDashboardTestContext } from '@/app/mocks/dashboardTestContext.mock'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'

import { usePortfolioAllocationData } from './usePortfolioAllocationData'

afterEach(cleanup)

describe('usePortfolioAllocationData', () => {
  it('publishes cache readiness and subsequent allocation updates', async () => {
    const { client, data, wrapper } = createDashboardTestContext()
    const { result } = renderHook(usePortfolioAllocationData, { wrapper })
    expect(result.current.loading).toBe(false)
    act(() => {
      client.removeQueries({
        queryKey: portfolioQueryKeys.data('raw-isin-allocation'),
        exact: true,
      })
    })
    // A remounted consumer must distinguish a missing source from an empty successful source.
    const missing = renderHook(usePortfolioAllocationData, { wrapper })
    expect(missing.result.current.loading).toBe(true)
    act(() => {
      client.setQueryData(
        portfolioQueryKeys.data('raw-isin-allocation'),
        data.allocations,
      )
    })
    await waitFor(() => expect(missing.result.current.loading).toBe(false))
    client.clear()
  })
  it('does not claim empty allocations are loaded before a source exists', () => {
    const { client, wrapper } = createDashboardTestContext(false)
    const { result } = renderHook(usePortfolioAllocationData, { wrapper })
    expect(result.current.loading).toBe(true)
    expect(result.current.geo).toEqual([])
    client.clear()
  })
})
