import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'

import { useDashboardHistory } from './useDashboardHistory'

const FILTERS: DashboardFilters = {
  accountTypes: new Set(),
  accounts: new Set(),
  operationTypes: new Set(),
  hideClosedPositions: false,
}

function Probe() {
  const model = useDashboardHistory({
    allAccounts: [],
    allPositionRows: [],
    enrichedHistory: [],
    filters: FILTERS,
  })
  return (
    <output
      data-history={model.displayedHistory.length}
      data-status={model.irrStatus}
    />
  )
}

describe('useDashboardHistory', () => {
  it('uses the unfiltered fallback without exposing a loading IRR state', () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const html = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <Probe />
      </QueryClientProvider>,
    )
    expect(html).toContain('data-history="0"')
    expect(html).toContain('data-status="ready"')
  })
})
