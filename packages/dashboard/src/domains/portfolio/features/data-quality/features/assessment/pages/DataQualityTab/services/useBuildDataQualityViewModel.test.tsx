// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { createDataQualityTabProps } from '@/domains/portfolio/features/data-quality/features/assessment/mocks/dataQualityTabProps.mock'
import { createManualPriceOverride } from '@/domains/portfolio/features/data-quality/features/assessment/mocks/manualPriceOverride.mock'
import { pipelineError } from '@/domains/portfolio/features/data-quality/features/assessment/mocks/pipelineError.mock'

import { useBuildDataQualityViewModel } from './useBuildDataQualityViewModel'

afterEach(cleanup)

describe('data quality count formatting', () => {
  it.each([
    { count: 0, expected: '0' },
    { count: 1_234, expected: '1,234' },
  ])('formats $count anomalies and overrides', ({ count, expected }) => {
    const { result } = renderHook(useBuildDataQualityViewModel)
    const input = createDataQualityTabProps({
      errors: Array.from({ length: count }, (_, index) =>
        pipelineError({ name: `Asset ${index}` }),
      ),
      manualPriceOverrides: Array.from({ length: count }, (_, index) =>
        createManualPriceOverride({ name: `Asset ${index}` }),
      ),
    })
    const model = result.current(input)

    expect(model.themes.find((theme) => theme.id === 'pipeline')?.metric).toBe(
      expected,
    )
    expect(model.themes.find((theme) => theme.id === 'prices')?.metric).toBe(
      expected,
    )
  })
})
