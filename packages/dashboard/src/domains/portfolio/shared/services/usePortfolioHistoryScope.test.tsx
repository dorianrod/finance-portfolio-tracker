// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { createDashboardTestContext } from '@/app/mocks/dashboardTestContext.mock'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'

import { usePortfolioHistoryScope } from './usePortfolioHistoryScope'

afterEach(cleanup)

describe('usePortfolioHistoryScope', () => {
  it('applies period changes to the source history at its consumer', async () => {
    const { client, store, data, wrapper } = createDashboardTestContext()
    client.setQueryData(
      portfolioQueryKeys.data('portfolio-history'),
      data.history.map((point) => ({ ...point, date: new Date('2026-01-31') })),
    )
    const { result } = renderHook(usePortfolioHistoryScope, { wrapper })
    expect(result.current.displayedHistory[0]?.date).toEqual(
      new Date('2026-01-31'),
    )
    act(() =>
      store.set(dashboardFiltersAtom, (current) => ({
        ...current,
        dateFrom: new Date('2026-02-01'),
      })),
    )
    await waitFor(() => expect(result.current.displayedHistory).toEqual([]))
    client.clear()
  })
  it('keeps missing history separate from the required-source load gate', () => {
    const { client, wrapper } = createDashboardTestContext(false)
    const { result } = renderHook(usePortfolioHistoryScope, { wrapper })
    expect(result.current.displayedHistory).toEqual([])
    expect(result.current.globalTri).toBeNull()
    client.clear()
  })
})
