// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { Provider } from 'jotai'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createConcentrationHistoryPoint } from '@/domains/portfolio/features/diversification/features/concentration/mocks/concentrationHistoryPoint.mock'

import { useConcentrationTrendController } from './useConcentrationTrendController'

function TestProvider({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>
}

const HELD_POINTS = [
  createConcentrationHistoryPoint(),
  createConcentrationHistoryPoint({ date: new Date('2026-02-28') }),
]
const UNDERLYING_POINTS = [
  createConcentrationHistoryPoint({ coveragePct: 80 }),
  createConcentrationHistoryPoint({
    date: new Date('2026-02-28'),
    coveragePct: 90,
  }),
]

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('useConcentrationTrendController', () => {
  it.each([NaN, Infinity, -Infinity, 0.5])(
    'ignores an invalid timeline index (%s) without changing the snapshot',
    (index) => {
      const { result } = renderHook(
        () =>
          useConcentrationTrendController(HELD_POINTS, UNDERLYING_POINTS, true),
        { wrapper: TestProvider },
      )

      act(() => result.current.selectPoint(index))

      expect(result.current.selectedIndex).toBe(1)
      expect(result.current.displayedPoint).toBe(HELD_POINTS[1])
    },
  )

  it.each([
    { index: -10, expectedIndex: 0 },
    { index: 10, expectedIndex: 1 },
  ])(
    'clamps timeline selection to its bounds ($index)',
    ({ index, expectedIndex }) => {
      const { result } = renderHook(
        () =>
          useConcentrationTrendController(HELD_POINTS, UNDERLYING_POINTS, true),
        { wrapper: TestProvider },
      )

      act(() => result.current.selectPoint(index))

      expect(result.current.selectedIndex).toBe(expectedIndex)
      expect(result.current.displayedPoint).toBe(HELD_POINTS[expectedIndex])
    },
  )

  it('falls back to held positions when underlying data becomes unavailable', () => {
    const { result, rerender } = renderHook(
      ({ available }) =>
        useConcentrationTrendController(
          HELD_POINTS,
          UNDERLYING_POINTS,
          available,
        ),
      { wrapper: TestProvider, initialProps: { available: true } },
    )
    act(() => result.current.changeMode('lookThrough'))
    expect(result.current.displayedPoint).toBe(UNDERLYING_POINTS[1])

    rerender({ available: false })

    expect(result.current.mode).toBe('held')
    expect(result.current.displayedPoint).toBe(HELD_POINTS[1])

    rerender({ available: true })

    expect(result.current.mode).toBe('lookThrough')
    expect(result.current.displayedPoint).toBe(UNDERLYING_POINTS[1])
  })

  it('does not select or play an empty timeline', () => {
    const { result } = renderHook(
      () => useConcentrationTrendController([], [], false),
      { wrapper: TestProvider },
    )

    act(() => {
      result.current.selectPoint(0)
      result.current.togglePlayback()
      result.current.changeMode('lookThrough')
    })

    expect(result.current.displayedPoint).toBeUndefined()
    expect(result.current.isPlaying).toBe(false)
    expect(result.current.mode).toBe('held')
  })

  it('replays from the first snapshot and stops at the last snapshot', () => {
    vi.useFakeTimers()
    const { result } = renderHook(
      () =>
        useConcentrationTrendController(HELD_POINTS, UNDERLYING_POINTS, true),
      { wrapper: TestProvider },
    )

    act(() => result.current.togglePlayback())
    expect(result.current.displayedPoint).toBe(HELD_POINTS[0])
    expect(result.current.isPlaying).toBe(true)

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current.displayedPoint).toBe(HELD_POINTS[1])
    expect(result.current.isPlaying).toBe(false)
  })
})
