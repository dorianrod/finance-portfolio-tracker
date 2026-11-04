// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { createDashboardTestContext } from '@/app/mocks/dashboardTestContext.mock'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { rawData } from '@/domains/portfolio/shared/mocks/rawIsinData.mock'
import { isinRow } from '@/domains/portfolio/shared/mocks/rawIsinRow.mock'
import type { RawIsinRows } from '@/domains/portfolio/shared/types/rawIsinData.type'

import { usePortfolioAllocationData } from './usePortfolioAllocationData'

afterEach(cleanup)

describe('usePortfolioAllocationData', () => {
  it.each<keyof RawIsinRows>(['geo', 'secteur', 'currency', 'classe'])(
    'publishes replacement %s rows to an already mounted consumer',
    async (dimension) => {
      const { client, wrapper } = createDashboardTestContext()
      const { result } = renderHook(usePortfolioAllocationData, { wrapper })
      const firstRows = [isinRow({ values: { first: 100 } })]
      act(() => {
        client.setQueryData(
          portfolioQueryKeys.data('raw-isin-allocation'),
          rawData({ [dimension]: firstRows }),
        )
      })
      await waitFor(() => expect(result.current[dimension]).toEqual(firstRows))

      const replacementRows = [isinRow({ values: { replacement: 100 } })]
      act(() => {
        client.setQueryData(
          portfolioQueryKeys.data('raw-isin-allocation'),
          rawData({ [dimension]: replacementRows }),
        )
      })
      await waitFor(() =>
        expect(result.current[dimension]).toEqual(replacementRows),
      )
      expect(result.current.loading).toBe(false)
      client.clear()
    },
  )

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
