// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { createDashboardTestContext } from '@/app/mocks/dashboardTestContext.mock'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { makeDashboardData } from '@/domains/portfolio/shared/mocks/dashboardData.mock'
import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'

import { useQualityIssueScope } from './useQualityIssueScope'

afterEach(cleanup)

describe('useQualityIssueScope', () => {
  it('keeps assessment and error inspection on the same account scope', async () => {
    const { client, store, data, wrapper } = createDashboardTestContext()
    client.setQueryData(
      portfolioQueryKeys.data('dashboard'),
      makeDashboardData({ positions: [makePosition()] }),
    )
    const { result } = renderHook(useQualityIssueScope, { wrapper })
    expect(result.current.scopedPipelineErrors).toEqual(data.errors)
    act(() =>
      store.set(dashboardFiltersAtom, (current) => ({
        ...current,
        accountTypes: new Set(['CTO']),
      })),
    )
    await waitFor(() =>
      expect(result.current.scopedManualPriceOverrides).toEqual([]),
    )
    client.clear()
  })
  it('preserves a pending source state instead of treating it as a successful empty result', () => {
    const { client, wrapper } = createDashboardTestContext(false)
    const { result } = renderHook(useQualityIssueScope, { wrapper })
    expect(result.current.pipelineErrorsLoading).toBe(true)
    expect(result.current.scopedPipelineErrors).toEqual([])
    client.clear()
  })
})
