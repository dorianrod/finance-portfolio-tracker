// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { createInstance } from 'i18next'
import type { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { afterEach, describe, expect, it } from 'vitest'

import { useBuildAnalysisReliabilityMetrics } from './useBuildAnalysisReliabilityMetrics'

afterEach(cleanup)

describe('reliability metric labels', () => {
  it('uses the caller translation provider while preserving unavailable percentages', async () => {
    const instance = createInstance()
    await instance.init({
      lng: 'en',
      keySeparator: false,
      resources: {
        en: {
          translation: {
            'ui.app.diversification': 'Provider allocation',
            'ui.app.underlyingAssets': 'Provider exposures',
            'ui.app.portfolioData': 'Provider sources',
          },
        },
      },
    })
    function Wrapper({ children }: { children: ReactNode }) {
      return <I18nextProvider i18n={instance}>{children}</I18nextProvider>
    }
    const { result } = renderHook(useBuildAnalysisReliabilityMetrics, {
      wrapper: Wrapper,
    })
    const metrics = result.current({
      allocationLoading: true,
      classificationReliabilityPct: 80,
      classificationMappedValue: 80,
      classificationMetricTone: 'warning',
      underlyingReliabilityPct: null,
      identifiedFundValue: 0,
      underlyingMetricTone: 'unavailable',
      portfolioDataStatus: 'Ready',
      portfolioDataTone: 'healthy',
    })
    expect(metrics.reliabilityMetrics).toEqual([
      {
        percentage: null,
        amount: 80,
        metricLabel: 'Provider allocation',
        tone: 'warning',
      },
      {
        percentage: null,
        amount: 0,
        metricLabel: 'Provider exposures',
        tone: 'unavailable',
      },
    ])
    expect(metrics.portfolioStatusMetric).toEqual({
      value: 'Ready',
      metricLabel: 'Provider sources',
      tone: 'healthy',
    })
  })
})
