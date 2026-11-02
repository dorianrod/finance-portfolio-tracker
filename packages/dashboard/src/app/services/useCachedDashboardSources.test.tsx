// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'

import { createDashboardSourceFixtures } from '../mocks/dashboardSources.mock'
import { useCachedDashboardSources } from './useCachedDashboardSources'

const clients: QueryClient[] = []
afterEach(() => {
  cleanup()
  clients.splice(0).forEach((client) => client.clear())
})
function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  clients.push(client)
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return { client, wrapper: Wrapper }
}

describe('useCachedDashboardSources', () => {
  it('keeps each source channel attached to its own validated cache', () => {
    const { client, wrapper } = setup()
    const data = createDashboardSourceFixtures()
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
    const { result } = renderHook(useCachedDashboardSources, { wrapper })
    expect(result.current.map((source) => source.data)).toEqual([
      data.dashboard,
      data.history,
      data.positions,
      data.errors,
      data.overrides,
      data.operations,
      data.allocations,
      data.funds,
      data.diagnostics,
      data.income,
    ])
  })
  it('preserves missing source states without fetching', () => {
    const { wrapper } = setup()
    const { result } = renderHook(useCachedDashboardSources, { wrapper })
    expect(
      result.current.map((source) => [source.isPending, source.fetchStatus]),
    ).toEqual(Array.from({ length: 10 }, () => [true, 'idle']))
  })
})
