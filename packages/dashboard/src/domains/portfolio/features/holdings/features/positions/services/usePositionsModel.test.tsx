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

import { usePositionsModel } from './usePositionsModel'

afterEach(cleanup)

describe('usePositionsModel', () => {
  it('recomputes the table from direct account-type subscriptions', async () => {
    const { client, store, wrapper } = createDashboardTestContext()
    client.setQueryData(
      portfolioQueryKeys.data('dashboard'),
      makeDashboardData({
        positions: [makePosition()],
        rawPositions: [pos({})],
        rawOperations: [op({})],
      }),
    )
    const { result } = renderHook(usePositionsModel, { wrapper })
    expect(result.current.tableData.length).toBeGreaterThan(0)
    act(() =>
      store.set(dashboardFiltersAtom, (current) => ({
        ...current,
        accountTypes: new Set(['CTO']),
      })),
    )
    await waitFor(() => expect(result.current.tableData).toEqual([]))
    client.clear()
  })
  it('renders an empty table when no position source exists', () => {
    const { client, wrapper } = createDashboardTestContext(false)
    const { result } = renderHook(usePositionsModel, { wrapper })
    expect(result.current.tableData).toEqual([])
    expect(result.current.fundStatuses).toEqual([])
    client.clear()
  })
})
