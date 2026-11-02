// @vitest-environment jsdom
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { createDashboardTestContext } from '@/app/mocks/dashboardTestContext.mock'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { makeDashboardData } from '@/domains/portfolio/shared/mocks/dashboardData.mock'
import { pos } from '@/domains/portfolio/shared/mocks/rawPosition.mock'

import { useOverviewModel } from './useOverviewModel'

afterEach(cleanup)

describe('useOverviewModel', () => {
  it('builds comparisons from the cached raw positions', async () => {
    const { client, wrapper } = createDashboardTestContext()
    client.setQueryData(
      portfolioQueryKeys.data('dashboard'),
      makeDashboardData({
        rawPositions: [
          pos({ snapshot_date: new Date('2026-01-31') }),
          pos({ snapshot_date: new Date('2026-02-28'), total_value: 1500 }),
        ],
      }),
    )
    const { result } = renderHook(useOverviewModel, { wrapper })
    await waitFor(() =>
      expect(result.current.overviewComparison?.value.current).toBe(1500),
    )
    client.clear()
  })
  it('reports an unavailable comparison for a source with no dated values', () => {
    const { client, wrapper } = createDashboardTestContext()
    const { result } = renderHook(useOverviewModel, { wrapper })
    expect(result.current.overviewComparison).toBeNull()
    client.clear()
  })
})
