import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'

import { useDashboardPerformance } from './useDashboardPerformance'

const FILTERS: DashboardFilters = {
  accountTypes: new Set(),
  accounts: new Set(),
  operationTypes: new Set(),
  hideClosedPositions: false,
}

function Probe() {
  const model = useDashboardPerformance({
    currentPositions: [],
    displayedHistory: [],
    filters: FILTERS,
    periodPositions: [],
  })
  return (
    <output
      data-income={model.passiveIncome.length}
      data-total={model.performance.currentValueGross}
    />
  )
}

describe('useDashboardPerformance', () => {
  it('provides zeroed performance before server data resolves', () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const html = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <Probe />
      </QueryClientProvider>,
    )
    expect(html).toContain('data-income="0"')
    expect(html).toContain('data-total="0"')
  })
})
