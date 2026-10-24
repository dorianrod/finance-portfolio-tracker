import { useMemo } from 'react'
import type { PipelineError } from '@/domains/portfolio/shared/types/pipelineError.type'
import type { FundHoldingsData } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { ManualPriceOverride } from '@/domains/portfolio/shared/types/manualPriceOverride.type'
import type { RawIsinData } from '@/domains/portfolio/shared/types/rawIsinData.type'
import { buildDataQualitySummary } from '@/domains/portfolio/features/data-quality/helpers/mappers/buildDataQualitySummary'
import { scopeManualPriceOverrides, scopePipelineErrors } from '@/domains/portfolio/shared/helpers/filters/portfolioDataFilters'
import { computeAllocationCoverageByAccount } from '@/domains/portfolio/shared/helpers/quality/computeAllocationCoverage'
import { scopeFundQualityData } from '@/domains/portfolio/shared/helpers/quality/scopeFundQualityData'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import type { HoldingsView } from '@/domains/portfolio/shared/types/dashboardView.type'
import type { AnalysisTab } from '@/domains/portfolio/shared/stores/dashboardNavigation.atoms'

type DashboardQualityInput = {
  activeTab: AnalysisTab
  filters: DashboardFilters
  fundData: FundHoldingsData
  holdingsView: HoldingsView
  latestAccountPositions: PositionRow[]
  manualPriceOverrides: ManualPriceOverride[]
  pipelineErrors: PipelineError[]
  pipelineErrorsLoading: boolean
  rawAllocationData: RawIsinData
  tableFiltered: PositionRow[]
}

export function useDashboardQuality({
  activeTab,
  filters,
  fundData,
  holdingsView,
  latestAccountPositions,
  manualPriceOverrides,
  pipelineErrors,
  pipelineErrorsLoading,
  rawAllocationData,
  tableFiltered,
}: DashboardQualityInput) {
  const coverage = useMemo(
    () => rawAllocationData.loading
      ? []
      : computeAllocationCoverageByAccount(latestAccountPositions, rawAllocationData),
    [latestAccountPositions, rawAllocationData],
  )
  const scopedFundQuality = useMemo(
    () => scopeFundQualityData(
      latestAccountPositions,
      fundData.holdings,
      fundData.statuses,
      fundData.snapshots,
      fundData.unresolved,
      fundData.report,
    ),
    [
      fundData.holdings,
      fundData.report,
      fundData.snapshots,
      fundData.statuses,
      fundData.unresolved,
      latestAccountPositions,
    ],
  )
  const pipelineQualityPositions = activeTab === 'holdings' && holdingsView === 'positions'
    ? tableFiltered
    : latestAccountPositions
  const scopedPipelineErrors = useMemo(
    () => scopePipelineErrors(pipelineErrors, pipelineQualityPositions, filters),
    [filters, pipelineErrors, pipelineQualityPositions],
  )
  const scopedManualPriceOverrides = useMemo(
    () => scopeManualPriceOverrides(manualPriceOverrides, latestAccountPositions, filters),
    [filters, latestAccountPositions, manualPriceOverrides],
  )
  const qualitySummary = useMemo(
    () => buildDataQualitySummary({
      allocationLoading: rawAllocationData.loading,
      coverage,
      pipelineErrorsLoading,
      scopedFundQuality,
      scopedManualPriceOverrides,
      scopedPipelineErrors,
    }),
    [
      coverage,
      pipelineErrorsLoading,
      rawAllocationData.loading,
      scopedFundQuality,
      scopedManualPriceOverrides,
      scopedPipelineErrors,
    ],
  )

  return {
    qualitySummary,
    scopedFundQuality,
    scopedManualPriceOverrides,
    scopedPipelineErrors,
  }
}
