// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { createStore, Provider, useAtomValue } from 'jotai'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  dashboardThemeAtom,
  DEFAULT_DASHBOARD_THEME,
  THEME_STORAGE_KEY,
} from './dashboardTheme.atoms'

function mountTheme() {
  const store = createStore()
  function Wrapper({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>
  }
  const hook = renderHook(() => useAtomValue(dashboardThemeAtom), {
    wrapper: Wrapper,
  })
  return { ...hook, store }
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('stored dashboard theme', () => {
  it('reads and writes the versioned theme through an isolated Jotai store', () => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify('dark'))
    const { result, store } = mountTheme()
    expect(result.current).toBe('dark')
    act(() => store.set(dashboardThemeAtom, 'light'))
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(
      JSON.stringify('light'),
    )
  })
  it.each(['invalid-json', '"unknown"', '{"theme":"dark"}'])(
    'ignores invalid persisted data %s',
    (stored) => {
      localStorage.setItem(THEME_STORAGE_KEY, stored)
      expect(mountTheme().result.current).toBe(DEFAULT_DASHBOARD_THEME)
    },
  )
  it('keeps theme changes usable when browser storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage full')
    })
    const { result, store } = mountTheme()
    act(() => store.set(dashboardThemeAtom, 'dark'))
    expect(result.current).toBe('dark')
  })
})
