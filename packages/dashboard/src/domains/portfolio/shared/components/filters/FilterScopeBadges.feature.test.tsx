import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createStore, Provider } from 'jotai'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFiltersAtom'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'

import { FilterScopeBadges } from './FilterScopeBadges.feature'

function render(
  filters: DashboardFilters,
  period: Parameters<typeof FilterScopeBadges>[0]['period'],
  account: Parameters<typeof FilterScopeBadges>[0]['account'] = 'filterable',
) {
  const store = createStore()
  store.set(dashboardFiltersAtom, filters)
  const queryClient = new QueryClient()
  queryClient.setQueryData(portfolioQueryKeys.data('dashboard'), {
    accountLabels: { acc1: 'Main PEA' },
    positions: [],
    rawOperations: [],
    rawPositions: [],
  })

  return renderToStaticMarkup(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <FilterScopeBadges account={account} period={period} />
      </QueryClientProvider>
    </Provider>,
  )
}

function filters(overrides: Partial<DashboardFilters> = {}): DashboardFilters {
  return {
    accounts: new Set(),
    accountTypes: new Set(),
    operationTypes: new Set(),
    hideClosedPositions: true,
    ...overrides,
  }
}

describe('FilterScopeBadges', () => {
  it('shows applied account and range scopes', () => {
    const html = render(
      filters({
        accounts: new Set(['acc1']),
        dateFrom: new Date('2026-01-01'),
        dateTo: new Date('2026-06-30'),
      }),
      'range',
    )
    expect(html).toContain('Main PEA')
    expect(html).toContain('Selected period')
  })

  it('warns when a global account scope ignores an active selection', () => {
    const html = render(
      filters({ accounts: new Set(['acc1']) }),
      'year-range',
      'global',
    )
    expect(html).toContain('Global accounts')
    expect(html).toContain('text-warning')
  })

  it('distinguishes an as-of date from a start-only filter', () => {
    expect(
      render(filters({ dateTo: new Date('2026-06-30') }), 'as-of'),
    ).toContain('As of 30 Jun 2026')
    expect(
      render(filters({ dateFrom: new Date('2026-01-01') }), 'as-of'),
    ).toContain('Latest snapshot · start ignored')
  })
})
