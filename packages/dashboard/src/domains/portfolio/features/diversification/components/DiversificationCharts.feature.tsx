import { useAtomValue } from 'jotai'
import { useState } from 'react'

import { useDiversificationCharts } from '@/domains/portfolio/features/diversification/services/useDiversificationCharts'
import {
  dashboardDiversificationFilterAtom,
  dashboardDiversificationViewAtom,
} from '@/domains/portfolio/shared/stores/dashboardDiversification.atoms'
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

import { DiversificationCurrentView } from './DiversificationCurrentView.feature'
import { DiversificationTrendView } from './DiversificationTrendView.feature'
import { FilteredPositionsTable } from './FilteredPositionsTable.feature'

type DiversificationChartsProps = {
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

export function DiversificationCharts({
  positions,
  rawPositions,
  fundHoldings,
  fundHoldingsHistory,
  accountFilters,
  accountTypeFilters,
  rawData,
  dateFrom,
  dateTo,
}: DiversificationChartsProps) {
  const [concentrationMode, setConcentrationMode] =
    useState<ConcentrationMode>('held')
  const activeFilter = useAtomValue(dashboardDiversificationFilterAtom)
  const view = useAtomValue(dashboardDiversificationViewAtom)
  const charts = useDiversificationCharts({
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
        {i18n.t('ui.diversificationcharts.loadingBreakdowns')}
      </Text>
    )

  if (hasSelectedValue && !hasApplicableValue) {
    return (
      <Text as="p" variant="body" tone="subtle">
        {i18n.t(
          'ui.diversificationcharts.diversificationIsNotApplicableToSavingsCheckingAndBrokerage',
        )}
      </Text>
    )
  }

  if (view === 'current' && !hasCurrentData) {
    return (
      <Text as="p" variant="body" tone="subtle">
        {i18n.t(
          'ui.diversificationcharts.noAllocationDataAvailableRunThePipelineToGenerate',
        )}
      </Text>
    )
  }

  return (
    <div className="flex flex-col gap-4 mb-6">
      {view === 'current' && (
        <DiversificationCurrentView
          charts={charts}
          concentrationMode={concentrationMode}
          onModeChange={setConcentrationMode}
          dateTo={dateTo}
        />
      )}
      {view === 'trend' && (
        <DiversificationTrendView
          charts={charts}
          lookThroughAvailable={fundHoldingsHistory.length > 0}
        />
      )}
      {/* ── Filtered positions panel ─────────────────────────────────────────────── */}
      <FilteredPositionsTable rows={tableRows} />
    </div>
  )
}
