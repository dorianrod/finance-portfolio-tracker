// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'
import { dashboardFiltersOpenAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFiltersOpen.atoms'

import { useDashboardFilterPanel } from './useDashboardFilterPanel'

afterEach(cleanup)

describe('useDashboardFilterPanel', () => {
  it('opens and closes the panel without changing portfolio filters or another store', () => {
    const store = createStore()
    const otherStore = createStore()
    const filters = store.get(dashboardFiltersAtom)
    function Wrapper({ children }: { children: ReactNode }) {
      return <Provider store={store}>{children}</Provider>
    }
    const { result } = renderHook(useDashboardFilterPanel, { wrapper: Wrapper })
    act(() => result.current.closeFilters())
    expect(store.get(dashboardFiltersOpenAtom)).toBe(false)
    act(() => result.current.openFilters())
    expect(store.get(dashboardFiltersOpenAtom)).toBe(true)
    expect(otherStore.get(dashboardFiltersOpenAtom)).toBe(false)
    act(() => result.current.closeFilters())
    expect(store.get(dashboardFiltersOpenAtom)).toBe(false)
    expect(store.get(dashboardFiltersAtom)).toBe(filters)
  })
})
