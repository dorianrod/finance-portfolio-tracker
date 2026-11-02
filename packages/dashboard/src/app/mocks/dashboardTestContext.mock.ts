import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createStore, Provider } from 'jotai'
import { createElement, type PropsWithChildren } from 'react'

import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { baseFilters } from '@/domains/portfolio/shared/mocks/dashboardFilters.mock'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'

import { createDashboardSourceFixtures } from './dashboardSources.mock'

export function createDashboardTestContext(seedSources = true) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, gcTime: 0 },
    },
  })
  const store = createStore()
  store.set(dashboardFiltersAtom, baseFilters())
  const data = createDashboardSourceFixtures()
  if (seedSources) {
    client.setQueryData(portfolioQueryKeys.data('dashboard'), data.dashboard)
    client.setQueryData(
      portfolioQueryKeys.data('portfolio-history'),
      data.history,
    )
    client.setQueryData(
      portfolioQueryKeys.data('all-positions'),
      data.positions,
    )
    client.setQueryData(portfolioQueryKeys.data('pipeline-errors'), data.errors)
    client.setQueryData(
      portfolioQueryKeys.data('manual-price-overrides'),
      data.overrides,
    )
    client.setQueryData(
      portfolioQueryKeys.data('monthly-operations'),
      data.operations,
    )
    client.setQueryData(
      portfolioQueryKeys.data('raw-isin-allocation'),
      data.allocations,
    )
    client.setQueryData(portfolioQueryKeys.data('fund-holdings'), data.funds)
    client.setQueryData(
      portfolioQueryKeys.data('fund-diagnostics'),
      data.diagnostics,
    )
    client.setQueryData(
      portfolioQueryKeys.data('annual-income-savings'),
      data.income,
    )
    client.setQueryData(portfolioQueryKeys.data('operations'), [])
    client.setQueryData(portfolioQueryKeys.data('saving-capacity-source'), [])
    client.setQueryData(portfolioQueryKeys.data('account-savings-source'), [])
  }
  function Wrapper({ children }: PropsWithChildren) {
    return createElement(
      QueryClientProvider,
      { client },
      createElement(Provider, { store }, children),
    )
  }
  return { client, store, data, wrapper: Wrapper }
}
