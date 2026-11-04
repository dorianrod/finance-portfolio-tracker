// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useChartViewport } from './useChartViewport'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function Probe() {
  const { ref, ready } = useChartViewport()
  return <div ref={ref}>{ready ? 'Ready' : 'Waiting'}</div>
}

describe('useChartViewport', () => {
  it('waits for intersection, disconnects after revealing, and retains readiness', () => {
    let notify!: (
      entries: Array<Pick<IntersectionObserverEntry, 'isIntersecting'>>,
    ) => void
    const observe = vi.fn()
    const disconnect = vi.fn()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: typeof notify) {
          notify = callback
        }
        observe = observe
        disconnect = disconnect
      },
    )
    const { rerender } = render(<Probe />)
    expect(screen.getByText('Waiting')).toBeTruthy()
    expect(observe).toHaveBeenCalledTimes(1)
    act(() => notify([{ isIntersecting: false }]))
    expect(screen.getByText('Waiting')).toBeTruthy()
    act(() => notify([{ isIntersecting: true }]))
    expect(screen.getByText('Ready')).toBeTruthy()
    expect(disconnect).toHaveBeenCalledTimes(1)
    act(() => notify([{ isIntersecting: false }]))
    rerender(<Probe />)
    expect(screen.getByText('Ready')).toBeTruthy()
  })

  it('reveals offscreen charts for printing and cleans up a pending observation', () => {
    const disconnect = vi.fn()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn()
        disconnect = disconnect
      },
    )
    const { unmount } = render(
      <>
        <Probe />
        <Probe />
      </>,
    )
    expect(screen.getAllByText('Waiting')).toHaveLength(2)
    act(() => {
      window.dispatchEvent(new Event('beforeprint'))
    })
    expect(screen.getAllByText('Ready')).toHaveLength(2)
    expect(disconnect).toHaveBeenCalledTimes(2)
    unmount()
    const pending = render(<Probe />)
    pending.unmount()
    expect(disconnect).toHaveBeenCalledTimes(3)
  })

  it('renders eagerly without IntersectionObserver support', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    render(<Probe />)
    expect(screen.getByText('Ready')).toBeTruthy()
  })
})
