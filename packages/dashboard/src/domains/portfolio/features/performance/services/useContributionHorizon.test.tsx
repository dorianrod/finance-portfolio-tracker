// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { Provider } from 'jotai'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { createPerformanceContributionSummary } from '@/domains/portfolio/features/performance/mocks/performanceContributionSummary.mock'

import { useContributionHorizon } from './useContributionHorizon'

const input: Parameters<typeof useContributionHorizon>[0] = {
  sinceTracking: createPerformanceContributionSummary(),
  sinceTrackingIrr: 12,
  trailingThreeYears: createPerformanceContributionSummary({
    horizon: 'trailing-3y',
  }),
  trailingThreeYearIrr: 8,
}

function wrapper({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>
}

afterEach(cleanup)

describe('useContributionHorizon', () => {
  it('switches the summary and its IRR together', () => {
    const { result } = renderHook(() => useContributionHorizon(input), {
      wrapper,
    })
    expect(result.current.activeHorizon).toBe('since-tracking')
    act(() => result.current.setHorizon('trailing-3y'))
    expect(result.current.summary).toBe(input.trailingThreeYears)
    expect(result.current.irr).toBe(8)
  })

  it('falls back while the requested period is unavailable and restores the preference', () => {
    const { result, rerender } = renderHook(
      (props) => useContributionHorizon(props),
      { wrapper, initialProps: input },
    )
    act(() => result.current.setHorizon('trailing-3y'))
    rerender({ ...input, trailingThreeYearIrr: null })
    expect(result.current.activeHorizon).toBe('since-tracking')
    expect(result.current.summary).toBe(input.sinceTracking)
    expect(result.current.irr).toBe(12)
    rerender(input)
    expect(result.current.activeHorizon).toBe('trailing-3y')
  })

  it('isolates consumers in different stores', () => {
    const first = renderHook(() => useContributionHorizon(input), { wrapper })
    const second = renderHook(() => useContributionHorizon(input), { wrapper })
    act(() => first.result.current.setHorizon('trailing-3y'))
    expect(second.result.current.activeHorizon).toBe('since-tracking')
  })
})
