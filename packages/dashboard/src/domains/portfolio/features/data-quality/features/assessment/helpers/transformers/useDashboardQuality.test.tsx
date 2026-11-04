import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { makeFundDiagnostics } from '@/domains/portfolio/features/data-quality/features/assessment/mocks/fundDiagnostics.mock'
import { baseFilters as fixtureDashboardFilters } from '@/domains/portfolio/shared/mocks/dashboardFilters.mock'
import { makeFundHoldingsData } from '@/domains/portfolio/shared/mocks/fundHoldingsData.mock'
import { rawData } from '@/domains/portfolio/shared/mocks/rawIsinData.mock'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'

import { useDashboardQuality } from './useDashboardQuality'

const FILTERS: DashboardFilters = fixtureDashboardFilters()

function Probe() {
  const model = useDashboardQuality({
    activeTab: 'quality',
    filters: FILTERS,
    fundData: { ...makeFundHoldingsData(), ...makeFundDiagnostics() },
    holdingsView: 'positions',
    latestAccountPositions: [],
    manualPriceOverrides: [],
    pipelineErrors: [],
    pipelineErrorsLoading: false,
    rawAllocationData: rawData(),
    tableFiltered: [],
  })
  return (
    <output
      data-errors={model.scopedPipelineErrors.length}
      data-funds={model.scopedFundQuality.statuses.length}
    />
  )
}

describe('useDashboardQuality', () => {
  it('returns empty scoped diagnostics for an empty portfolio', () => {
    const html = renderToStaticMarkup(<Probe />)
    expect(html).toContain('data-errors="0"')
    expect(html).toContain('data-funds="0"')
  })
})
