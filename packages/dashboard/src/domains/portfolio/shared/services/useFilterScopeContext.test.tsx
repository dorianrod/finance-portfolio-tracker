// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { afterEach, expect, it } from 'vitest'

import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'

import { useFilterScopeContext } from './useFilterScopeContext'

afterEach(cleanup)

it('subscribes to raw filters without preparing visual output', () => {
  const store = createStore()
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  const { result } = renderHook(() => useFilterScopeContext(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </Provider>
    ),
  })
  expect(result.current.filters.accounts.size).toBe(0)
  act(() =>
    store.set(dashboardFiltersAtom, (current) => ({
      ...current,
      accounts: new Set(['first', 'second']),
      dateTo: new Date('2026-10-31'),
    })),
  )
  expect(result.current.filters.accounts).toEqual(new Set(['first', 'second']))
  expect(result.current.filters.dateTo).toEqual(new Date('2026-10-31'))
  expect(result.current.accountLabels).toEqual({})
  client.clear()
})
