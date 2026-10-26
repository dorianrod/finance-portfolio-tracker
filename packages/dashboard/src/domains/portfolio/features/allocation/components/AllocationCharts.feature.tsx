import { useAtomValue } from 'jotai'
import { useState } from 'react'

import { useAllocationCharts } from '@/domains/portfolio/features/allocation/services/useAllocationCharts'
import {
  dashboardAllocationFilterAtom,
  dashboardAllocationViewAtom,
} from '@/domains/portfolio/shared/stores/dashboardAllocation.atoms'
import type { ConcentrationMode } from '@/domains/portfolio/shared/types/concentrationMode.type'
import type {
  FundHolding,
  HistoricalFundHolding,
} from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import type { RawIsinData } from '@/domains/portfolio/shared/types/rawIsinData.type'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'
import i18n from '@/i18n/i18n'
import { Text } from '@/shared/ui/Text.view'

import { AllocationCurrentView } from './AllocationCurrentView.feature'
import { AllocationTrendView } from './AllocationTrendView.feature'
import { FilteredPositionsTable } from './FilteredPositionsTable.feature'

type AllocationChartsProps = {
  positions: PositionRow[]
  rawPositions: RawPosition[]
  fundHoldings: FundHolding[]
  fundHoldingsHistory: HistoricalFundHolding[]
  accountFilters: Set<string>
  accountTypeFilters: Set<string>
  rawData: RawIsinData
  dateFrom?: Date
  dateTo?: Date
}

export function AllocationCharts({
  positions,
  rawPositions,
  fundHoldings,
  fundHoldingsHistory,
  accountFilters,
  accountTypeFilters,
  rawData,
  dateFrom,
  dateTo,
}: AllocationChartsProps) {
  const [concentrationMode, setConcentrationMode] =
    useState<ConcentrationMode>('held')
  const activeFilter = useAtomValue(dashboardAllocationFilterAtom)
  const view = useAtomValue(dashboardAllocationViewAtom)
  const charts = useAllocationCharts({
    positions,
    rawPositions,
    fundHoldings,
    fundHoldingsHistory,
    accountFilters,
    accountTypeFilters,
    activeFilter,
    concentrationMode,
    rawData,
    dateFrom,
    dateTo,
  })
  const {
    baseGeo,
    baseSecteur,
    baseCurrency,
    baseClasse,
    hasSelectedValue,
    hasApplicableValue,
    tableRows,
  } = charts
  const hasCurrentData = [baseGeo, baseSecteur, baseCurrency, baseClasse].some(
    (points) => points.length > 0,
  )
  if (rawData.loading)
    return (
      <Text as="p" variant="body" tone="muted">
        {i18n.t('ui.allocationcharts.loadingBreakdowns')}
      </Text>
    )

  if (hasSelectedValue && !hasApplicableValue) {
    return (
      <Text as="p" variant="body" tone="subtle">
        {i18n.t(
          'ui.allocationcharts.diversificationIsNotApplicableToSavingsCheckingAndBrokerage',
        )}
      </Text>
    )
  }

  if (view === 'current' && !hasCurrentData) {
    return (
      <Text as="p" variant="body" tone="subtle">
        {i18n.t(
          'ui.allocationcharts.noAllocationDataAvailableRunThePipelineToGenerate',
        )}
      </Text>
    )
  }

  return (
    <div className="flex flex-col gap-4 mb-6">
      {view === 'current' && (
        <AllocationCurrentView
          charts={charts}
          concentrationMode={concentrationMode}
          onModeChange={setConcentrationMode}
          dateTo={dateTo}
        />
      )}
      {view === 'trend' && (
        <AllocationTrendView
          charts={charts}
          lookThroughAvailable={fundHoldingsHistory.length > 0}
        />
      )}
      {/* ── Filtered positions panel ─────────────────────────────────────────────── */}
      <FilteredPositionsTable rows={tableRows} />
    </div>
  )
}
