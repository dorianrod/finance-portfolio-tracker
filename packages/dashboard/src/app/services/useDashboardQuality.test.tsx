import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { useDashboardQuality } from './useDashboardQuality'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'

const FILTERS: DashboardFilters = {
  accountTypes: new Set(),
  accounts: new Set(),
  operationTypes: new Set(),
  hideClosedPositions: false,
}

function Probe() {
  const model = useDashboardQuality({
    activeTab: 'quality',
    filters: FILTERS,
    fundData: { holdings: [], history: [], statuses: [], report: null, snapshots: [], unresolved: [] },
    holdingsView: 'positions',
    latestAccountPositions: [],
    manualPriceOverrides: [],
    pipelineErrors: [],
    pipelineErrorsLoading: false,
    rawAllocationData: { geo: [], secteur: [], currency: [], classe: [], loading: false },
    tableFiltered: [],
  })
  return <output data-errors={model.scopedPipelineErrors.length} data-funds={model.scopedFundQuality.statuses.length} />
}

describe('useDashboardQuality', () => {
  it('returns empty scoped diagnostics for an empty portfolio', () => {
    const html = renderToStaticMarkup(<Probe />)
    expect(html).toContain('data-errors="0"')
    expect(html).toContain('data-funds="0"')
  })
})
