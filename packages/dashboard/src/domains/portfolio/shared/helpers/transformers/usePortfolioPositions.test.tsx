import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { baseFilters as fixtureDashboardFilters } from '@/domains/portfolio/shared/mocks/dashboardFilters.mock'
import { makeFundHoldingsData } from '@/domains/portfolio/shared/mocks/fundHoldingsData.mock'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'

import { usePortfolioPositions } from './usePortfolioPositions'

const FILTERS: DashboardFilters = fixtureDashboardFilters()

function Probe() {
  const model = usePortfolioPositions({
    filters: FILTERS,
    fundData: makeFundHoldingsData(),
    positions: [],
    rawOperations: [],
    rawPositions: [],
  })
  return (
    <output
      data-current={model.currentPositions.length}
      data-table={model.tableFiltered.length}
    />
  )
}

describe('usePortfolioPositions', () => {
  it('returns an empty, coherent positions model when no source data exists', () => {
    const html = renderToStaticMarkup(<Probe />)
    expect(html).toContain('data-current="0"')
    expect(html).toContain('data-table="0"')
  })
})
