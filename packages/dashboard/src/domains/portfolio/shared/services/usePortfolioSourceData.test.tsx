// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { createDashboardTestContext } from '@/app/mocks/dashboardTestContext.mock'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { makeDashboardData } from '@/domains/portfolio/shared/mocks/dashboardData.mock'
import { pos } from '@/domains/portfolio/shared/mocks/rawPosition.mock'

import { usePortfolioSourceData } from './usePortfolioSourceData'

afterEach(cleanup)

describe('usePortfolioSourceData', () => {
  it('subscribes to validated source updates', async () => {
    const { client, wrapper } = createDashboardTestContext()
    const { result } = renderHook(usePortfolioSourceData, { wrapper })
    expect(result.current.rawPositions).toEqual([])
    act(() => {
      client.setQueryData(
        portfolioQueryKeys.data('dashboard'),
        makeDashboardData({ rawPositions: [pos({ account: 'fresh' })] }),
      )
    })
    await waitFor(() =>
      expect(result.current.rawPositions[0]?.account).toBe('fresh'),
    )
    client.clear()
  })
  it('supplies empty inputs until required sources arrive', () => {
    const { client, wrapper } = createDashboardTestContext(false)
    const { result } = renderHook(usePortfolioSourceData, { wrapper })
    expect(result.current.positions).toEqual([])
    expect(result.current.fundHoldings.holdings).toEqual([])
    client.clear()
  })
})
