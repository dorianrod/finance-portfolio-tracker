import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { baseFilters as fixtureDashboardFilters } from '@/domains/portfolio/shared/mocks/dashboardFilters.mock'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'

import { useDashboardWealth } from './useDashboardWealth'

const FILTERS: DashboardFilters = fixtureDashboardFilters()

function Probe() {
  const model = useDashboardWealth({
    savingCapacity: [],
    allMonthlyOps: new Map(),
    annualIncomeSavings: [],
    currentPositions: [],
    filters: FILTERS,
  })
  return (
    <output
      data-history={model.displayedTypeHistory.length}
      data-drivers={model.wealthDrivers.length}
    />
  )
}

describe('useDashboardWealth', () => {
  it('provides empty chart models before source queries resolve', () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const html = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <Probe />
      </QueryClientProvider>,
    )
    expect(html).toContain('data-history="0"')
    expect(html).toContain('data-drivers="0"')
  })
})
