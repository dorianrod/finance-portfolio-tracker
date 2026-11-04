// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ChartViewport } from './ChartViewport.view'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('ChartViewport', () => {
  it('reserves the chart height before mounting offscreen content', () => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn()
        disconnect = vi.fn()
      },
    )
    const { container } = render(
      <ChartViewport label="Portfolio history" height={240}>
        <svg role="img" aria-label="Portfolio history" />
      </ChartViewport>,
    )
    expect(container.firstElementChild?.getAttribute('style')).toContain(
      'height: 240px',
    )
    expect(screen.queryByRole('img', { name: 'Portfolio history' })).toBeNull()
    const chart = screen.getByRole('group', { name: 'Portfolio history' })
    expect(chart.tabIndex).toBe(0)
    act(() => chart.focus())
    expect(chart.getAttribute('tabindex')).toBeNull()
  })

  it('renders the responsive chart at its measured size and forwards resize notifications', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(0, 0, 640, 240),
    )
    vi.stubGlobal(
      'ResizeObserver',
      class implements ResizeObserver {
        private readonly callback: ResizeObserverCallback
        constructor(callback: ResizeObserverCallback) {
          this.callback = callback
        }
        observe(target: Element) {
          this.callback(
            [
              {
                target,
                contentRect: new DOMRect(0, 0, 640, 240),
                borderBoxSize: [],
                contentBoxSize: [],
                devicePixelContentBoxSize: [],
              },
            ],
            this,
          )
        }
        disconnect = vi.fn()
        unobserve = vi.fn()
      },
    )
    const onResize = vi.fn()
    render(
      <ChartViewport label="Portfolio history" height={240} onResize={onResize}>
        <svg role="img" aria-label="Portfolio history" />
      </ChartViewport>,
    )
    expect(screen.getByRole('img', { name: 'Portfolio history' })).toBeTruthy()
    expect(onResize).toHaveBeenCalledWith(640, 240)
  })
})
