// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { dashboardDiversificationViewAtom } from '@/app/stores/dashboardDiversification.atoms'
import { dashboardDiversificationFilterAtom } from '@/domains/portfolio/features/diversification/features/allocation/stores/dashboardAllocation/dashboardDiversificationFilterAtom'
import { dashboardDiversificationPositionsOpenAtom } from '@/domains/portfolio/features/diversification/features/allocation/stores/dashboardAllocation/dashboardDiversificationPositionsOpenAtom'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFiltersAtom'

import { useResetDashboardFilters } from './useResetDashboardFilters'

afterEach(cleanup)

describe('reset dashboard filters', () => {
  it('clears portfolio and allocation selections together while retaining the display mode', () => {
    const store = createStore()
    store.set(dashboardFiltersAtom, {
      accounts: new Set(['broker']),
      accountTypes: new Set(['PEA']),
      operationTypes: new Set(['BUY'] as const),
      hideClosedPositions: false,
      dateFrom: new Date('2024-01-01'),
      dateTo: new Date('2024-12-31'),
    })
    store.set(dashboardDiversificationFilterAtom, {
      type: 'geo',
      value: 'France',
    })
    store.set(dashboardDiversificationPositionsOpenAtom, true)
    store.set(dashboardDiversificationViewAtom, 'trend')
    function Wrapper({ children }: { children: ReactNode }) {
      return <Provider store={store}>{children}</Provider>
    }
    const { result } = renderHook(useResetDashboardFilters, {
      wrapper: Wrapper,
    })

    act(() => result.current())

    expect(store.get(dashboardFiltersAtom)).toEqual({
      accounts: new Set(),
      accountTypes: new Set(),
      operationTypes: new Set(),
      hideClosedPositions: true,
    })
    expect(store.get(dashboardDiversificationFilterAtom)).toBeNull()
    expect(store.get(dashboardDiversificationPositionsOpenAtom)).toBe(false)
    expect(store.get(dashboardDiversificationViewAtom)).toBe('trend')
  })
})
