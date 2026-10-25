// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { PieEntry } from '@/domains/portfolio/shared/types/allocationChart.type'

import { DonutCardView } from './DonutCard.view'

const categories: PieEntry[] = [
  { name: 'France', value: 60, total: 100 },
  { name: 'Japan', value: 40, total: 100 },
]

beforeEach(() => {
  vi.useFakeTimers()
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 640, 300),
  )
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('DonutCardView', () => {
  it('keeps rendering when filtering removes categories during an animation', async () => {
    const props = {
      title: 'Geography',
      date: new Date('2026-10-25'),
      total: 100,
      activeCategory: null,
      isFiltered: false,
      onSelect: vi.fn(),
    }
    const { rerender } = render(
      <DonutCardView {...props} data={categories}>
        <DonutCardView.Tooltip>Allocation details</DonutCardView.Tooltip>
      </DonutCardView>,
    )
    await act(() => vi.advanceTimersByTimeAsync(2_000))
    expect(screen.getByRole('application')).toBeTruthy()
    expect(screen.getByText('France')).toBeTruthy()
    expect(screen.getByText('Japan')).toBeTruthy()

    rerender(
      <DonutCardView {...props} data={[categories[0]]}>
        <DonutCardView.Tooltip>Allocation details</DonutCardView.Tooltip>
      </DonutCardView>,
    )
    await act(() => vi.advanceTimersByTimeAsync(100))
    expect(screen.getByRole('application')).toBeTruthy()
    await act(() => vi.advanceTimersByTimeAsync(2_000))
    expect(screen.getByText('France')).toBeTruthy()
    expect(screen.queryByText('Japan')).toBeNull()
  })
})
