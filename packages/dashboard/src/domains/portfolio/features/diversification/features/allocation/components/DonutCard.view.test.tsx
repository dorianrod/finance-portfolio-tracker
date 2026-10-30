// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { makePieEntry } from '@/domains/portfolio/shared/mocks/pieEntry.mock'

import { DonutCardView } from './DonutCard.view'

const categories = [makePieEntry(), makePieEntry({ name: 'Japan', value: 40 })]

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
    expect(screen.getByRole('button', { name: 'France' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Japan' })).toBeTruthy()

    rerender(
      <DonutCardView {...props} data={[categories[0]]}>
        <DonutCardView.Tooltip>Allocation details</DonutCardView.Tooltip>
      </DonutCardView>,
    )
    await act(() => vi.advanceTimersByTimeAsync(100))
    expect(screen.getByRole('application')).toBeTruthy()
    await act(() => vi.advanceTimersByTimeAsync(2_000))
    expect(screen.getByRole('button', { name: 'France' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Japan' })).toBeNull()
  })
  it('offers keyboard filtering for real categories and leaves grouped exposure informational', async () => {
    vi.useRealTimers()
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const data = [
      makePieEntry(),
      makePieEntry({ name: 'Japan', value: 37 }),
      makePieEntry({
        name: '',
        value: 3,
        subItems: [
          { name: 'Bonds', value: 1 },
          { name: 'Savings', value: 2 },
        ],
      }),
    ]
    const props = {
      title: 'Geography',
      date: new Date('2026-10-25'),
      total: 100,
      activeCategory: null,
      isFiltered: false,
      onSelect,
      data,
    }
    const { rerender } = render(
      <DonutCardView {...props}>{null}</DonutCardView>,
    )
    expect(screen.queryByRole('button', { name: 'others (2)' })).toBeNull()
    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'France' }),
    )
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenNthCalledWith(1, data[0])
    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Japan' }),
    )
    await user.keyboard('[Space]')
    expect(onSelect).toHaveBeenNthCalledWith(2, data[1])
    expect(onSelect).toHaveBeenCalledTimes(2)
    rerender(
      <DonutCardView {...props} activeCategory="France" isFiltered>
        {null}
      </DonutCardView>,
    )
    expect(
      screen
        .getByRole('button', { name: 'France' })
        .getAttribute('aria-pressed'),
    ).toBe('true')
    expect(
      screen
        .getByRole('button', { name: 'Japan' })
        .getAttribute('aria-pressed'),
    ).toBe('false')
  })
})
