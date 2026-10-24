import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { useDashboardWealth } from './useDashboardWealth'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'

const FILTERS: DashboardFilters = {
  accountTypes: new Set(),
  accounts: new Set(),
  operationTypes: new Set(),
  hideClosedPositions: false,
}

function Probe() {
  const model = useDashboardWealth({
    accountHistory: [],
    allMonthlyOps: new Map(),
    annualIncomeSavings: [],
    currentPositions: [],
    filters: FILTERS,
    fundHoldingsHistory: [],
    rawOperations: [],
    rawPositions: [],
  })
  return <output data-history={model.displayedTypeHistory.length} data-drivers={model.wealthDrivers.length} />
}

describe('useDashboardWealth', () => {
  it('provides empty chart models before source queries resolve', () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const html = renderToStaticMarkup(
      <QueryClientProvider client={client}><Probe /></QueryClientProvider>,
    )
    expect(html).toContain('data-history="0"')
    expect(html).toContain('data-drivers="0"')
  })
})
