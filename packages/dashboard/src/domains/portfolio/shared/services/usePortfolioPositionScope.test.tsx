// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { createDashboardTestContext } from '@/app/mocks/dashboardTestContext.mock'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { makeDashboardData } from '@/domains/portfolio/shared/mocks/dashboardData.mock'
import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'
import { op } from '@/domains/portfolio/shared/mocks/rawOperation.mock'
import { pos } from '@/domains/portfolio/shared/mocks/rawPosition.mock'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'

import { usePortfolioPositionScope } from './usePortfolioPositionScope'

afterEach(cleanup)

describe('usePortfolioPositionScope', () => {
  it('updates position scope when the shared account-type filter changes', async () => {
    const { client, store, wrapper } = createDashboardTestContext()
    client.setQueryData(
      portfolioQueryKeys.data('dashboard'),
      makeDashboardData({
        positions: [makePosition()],
        rawPositions: [pos({ account: 'broker' })],
        rawOperations: [op({ account: 'broker' })],
      }),
    )
    const { result } = renderHook(usePortfolioPositionScope, { wrapper })
    expect(result.current.currentPositions).toHaveLength(1)
    act(() =>
      store.set(dashboardFiltersAtom, (current) => ({
        ...current,
        accountTypes: new Set(['CTO']),
      })),
    )
    await waitFor(() => expect(result.current.currentPositions).toEqual([]))
    client.clear()
  })
  it('keeps unavailable position sources empty before loading', () => {
    const { client, wrapper } = createDashboardTestContext(false)
    const { result } = renderHook(usePortfolioPositionScope, { wrapper })
    expect(result.current.latestAccountPositions).toEqual([])
    expect(result.current.periodEndFundHoldings).toEqual([])
    client.clear()
  })
})
