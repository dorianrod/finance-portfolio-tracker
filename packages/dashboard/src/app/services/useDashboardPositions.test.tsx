import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'

import { useDashboardPositions } from './useDashboardPositions'

const FILTERS: DashboardFilters = {
  accountTypes: new Set(),
  accounts: new Set(),
  operationTypes: new Set(),
  hideClosedPositions: false,
}

function Probe() {
  const model = useDashboardPositions({
    allAccountTypes: [],
    filters: FILTERS,
    fundData: {
      holdings: [],
      history: [],
      statuses: [],
      report: null,
      snapshots: [],
      unresolved: [],
    },
    positions: [],
    rawOperations: [],
    rawPositions: [],
    sortDirection: 'desc',
    sortKey: 'total_value',
  })
  return (
    <output
      data-current={model.currentPositions.length}
      data-table={model.tableData.length}
    />
  )
}

describe('useDashboardPositions', () => {
  it('returns an empty, coherent positions model when no source data exists', () => {
    const html = renderToStaticMarkup(<Probe />)
    expect(html).toContain('data-current="0"')
    expect(html).toContain('data-table="0"')
  })
})
