// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { createDashboardTestContext } from '@/app/mocks/dashboardTestContext.mock'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'

import { useQualityAssessmentModel } from './useQualityAssessmentModel'

afterEach(cleanup)

describe('useQualityAssessmentModel', () => {
  it('updates quality when a cached source changes', async () => {
    const { client, data, wrapper } = createDashboardTestContext()
    const { result } = renderHook(useQualityAssessmentModel, { wrapper })
    expect(result.current.scopedPipelineErrors).toEqual(data.errors)
    act(() => {
      client.setQueryData(portfolioQueryKeys.data('pipeline-errors'), [])
    })
    await waitFor(() => expect(result.current.scopedPipelineErrors).toEqual([]))
    client.clear()
  })
  it('keeps pending source flags available to the persistent shell', () => {
    const { client, wrapper } = createDashboardTestContext(false)
    const { result } = renderHook(useQualityAssessmentModel, { wrapper })
    expect(result.current.pipelineErrorsLoading).toBe(true)
    expect(result.current.rawAllocationData.loading).toBe(true)
    client.clear()
  })
})
