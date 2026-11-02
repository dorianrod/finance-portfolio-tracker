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

import { useAllocationScope } from './useAllocationScope'

afterEach(cleanup)

describe('useAllocationScope', () => {
  it('updates diversification applicability with the selected account type', async () => {
    const { client, store, wrapper } = createDashboardTestContext()
    client.setQueryData(
      portfolioQueryKeys.data('dashboard'),
      makeDashboardData({
        positions: [makePosition()],
        rawPositions: [pos({})],
        rawOperations: [op({})],
      }),
    )
    const { result } = renderHook(useAllocationScope, { wrapper })
    expect(result.current.hasApplicableValue).toBe(true)
    act(() =>
      store.set(dashboardFiltersAtom, (current) => ({
        ...current,
        accountTypes: new Set(['CTO']),
      })),
    )
    await waitFor(() => expect(result.current.hasSelectedValue).toBe(false))
    client.clear()
  })
  it('distinguishes no allocation source from a loaded empty scope', () => {
    const { client, wrapper } = createDashboardTestContext(false)
    const { result } = renderHook(useAllocationScope, { wrapper })
    expect(result.current.loading).toBe(true)
    expect(result.current.hasCurrentData).toBe(false)
    client.clear()
  })
})
