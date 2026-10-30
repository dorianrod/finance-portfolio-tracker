// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { DEFAULT_DASHBOARD_FILTERS } from '@/domains/portfolio/shared/helpers/transformers/portfolioFilters/defaultDashboardFilters'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'
import { dashboardFiltersOpenAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFiltersOpen.atoms'

import { useDashboardFilters } from './useDashboardFilters'

afterEach(cleanup)

describe('useDashboardFilters', () => {
  it('applies consecutive updates and resets filters without changing panel visibility', () => {
    const store = createStore()
    store.set(dashboardFiltersOpenAtom, true)
    function Wrapper({ children }: { children: ReactNode }) {
      return <Provider store={store}>{children}</Provider>
    }
    const { result } = renderHook(useDashboardFilters, { wrapper: Wrapper })

    act(() => {
      result.current.setFilters((current) => ({
        ...current,
        accounts: new Set(['broker']),
      }))
      result.current.setFilters((current) => ({
        ...current,
        hideClosedPositions: false,
      }))
    })
    expect(store.get(dashboardFiltersAtom).accounts).toEqual(
      new Set(['broker']),
    )
    expect(store.get(dashboardFiltersAtom).hideClosedPositions).toBe(false)

    act(() => result.current.resetDashboardFilters())
    expect(store.get(dashboardFiltersAtom)).toEqual(DEFAULT_DASHBOARD_FILTERS)
    expect(store.get(dashboardFiltersOpenAtom)).toBe(true)
  })
})
