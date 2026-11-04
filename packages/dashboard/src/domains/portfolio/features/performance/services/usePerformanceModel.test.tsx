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

import { usePerformanceModel } from './usePerformanceModel'

afterEach(cleanup)

describe('usePerformanceModel', () => {
  it('updates performance scope without parent inputs', async () => {
    const { client, store, wrapper } = createDashboardTestContext()
    client.setQueryData(
      portfolioQueryKeys.data('dashboard'),
      makeDashboardData({
        positions: [makePosition()],
        rawPositions: [pos({})],
        rawOperations: [op({})],
      }),
    )
    const { result } = renderHook(usePerformanceModel, { wrapper })
    expect(result.current.rawPositions).toHaveLength(1)
    expect(result.current.performance.currentValueGross).toBe(1200)
    act(() =>
      store.set(dashboardFiltersAtom, (current) => ({
        ...current,
        accountTypes: new Set(['CTO']),
      })),
    )
    await waitFor(() =>
      expect(result.current.performance.currentValueGross).toBe(0),
    )
    client.clear()
  })
  it('keeps missing position values empty', () => {
    const { client, wrapper } = createDashboardTestContext()
    const { result } = renderHook(usePerformanceModel, { wrapper })
    expect(result.current.rawPositions).toEqual([])
    expect(result.current.performance.currentValueGross).toBe(0)
    client.clear()
  })
})
