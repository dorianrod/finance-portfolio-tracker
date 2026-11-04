// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { usePrefersReducedMotion } from './usePrefersReducedMotion'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('usePrefersReducedMotion', () => {
  it('reads the current preference immediately and follows browser changes', () => {
    const listeners = new Set<() => void>()
    const media = {
      matches: true,
      addEventListener: (_event: string, listener: () => void) =>
        listeners.add(listener),
      removeEventListener: (_event: string, listener: () => void) =>
        listeners.delete(listener),
    }
    vi.stubGlobal('matchMedia', () => media)
    const { result, unmount } = renderHook(usePrefersReducedMotion)
    expect(result.current).toBe(true)
    act(() => {
      media.matches = false
      listeners.forEach((listener) => listener())
    })
    expect(result.current).toBe(false)
    unmount()
    expect(listeners.size).toBe(0)
  })

  it('uses the default when the browser does not support media queries', () => {
    vi.stubGlobal('matchMedia', undefined)
    expect(renderHook(usePrefersReducedMotion).result.current).toBe(false)
  })
})
