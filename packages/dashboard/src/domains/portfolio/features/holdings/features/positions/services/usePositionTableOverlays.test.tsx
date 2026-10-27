// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createChartTarget } from '@/domains/portfolio/features/holdings/features/positions/mocks/chartTarget.mock'

import { usePositionTableOverlays } from './usePositionTableOverlays'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function wrapper({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>
}

describe('usePositionTableOverlays', () => {
  it('opens and dismisses a chart preview', () => {
    const target = createChartTarget()
    const { result } = renderHook(usePositionTableOverlays, { wrapper })
    act(() => result.current.setChart(target))
    expect(result.current.chart).toBe(target)
    act(() => result.current.dismiss())
    expect(result.current.chart).toBeNull()
  })

  it('cancels a pending dismissal and clears preview state on unmount', () => {
    vi.useFakeTimers()
    const store = createStore()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )
    const target = createChartTarget()
    const first = renderHook(usePositionTableOverlays, { wrapper })
    act(() => {
      first.result.current.setChart(target)
      first.result.current.scheduleHide()
      first.result.current.cancelHide()
      vi.runAllTimers()
    })
    expect(first.result.current.chart).toBe(target)
    first.unmount()
    const second = renderHook(usePositionTableOverlays, { wrapper })
    expect(second.result.current.chart).toBeNull()
  })

  it('keeps preview state isolated between stores', () => {
    const first = renderHook(usePositionTableOverlays, { wrapper })
    const second = renderHook(usePositionTableOverlays, { wrapper })
    act(() => first.result.current.setChart(createChartTarget()))
    expect(second.result.current.chart).toBeNull()
  })
})
