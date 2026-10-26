import { useMemo } from 'react'

import { scopeManualPriceOverrides } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/filters/qualityDataFilters/scopeManualPriceOverrides'
import { scopePipelineErrors } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/filters/qualityDataFilters/scopePipelineErrors'
import { buildDataQualitySummary } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/mappers/buildDataQualitySummary'
import { computeAllocationCoverageByAccount } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/computeAllocationCoverage/computeAllocationCoverageByAccount'
import { scopeFundQualityData } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/scopeFundQualityData/scopeFundQualityData'
import type { AnalysisTab } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardNavigation.types'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import type { HoldingsView } from '@/domains/portfolio/shared/types/dashboardView.type'
import type { FundHoldingsData } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { ManualPriceOverride } from '@/domains/portfolio/shared/types/manualPriceOverride.type'
import type { PipelineError } from '@/domains/portfolio/shared/types/pipelineError.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import type { RawIsinData } from '@/domains/portfolio/shared/types/rawIsinData.type'

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
    () =>
      rawAllocationData.loading
        ? []
        : computeAllocationCoverageByAccount(
            latestAccountPositions,
            rawAllocationData,
          ),
    [latestAccountPositions, rawAllocationData],
  )
  const scopedFundQuality = useMemo(
    () =>
      scopeFundQualityData(
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
  const pipelineQualityPositions =
    activeTab === 'holdings' && holdingsView === 'positions'
      ? tableFiltered
      : latestAccountPositions
  const scopedPipelineErrors = useMemo(
    () =>
      scopePipelineErrors(pipelineErrors, pipelineQualityPositions, filters),
    [filters, pipelineErrors, pipelineQualityPositions],
  )
  const scopedManualPriceOverrides = useMemo(
    () =>
      scopeManualPriceOverrides(
        manualPriceOverrides,
        latestAccountPositions,
        filters,
      ),
    [filters, latestAccountPositions, manualPriceOverrides],
  )
  const qualitySummary = useMemo(
    () =>
      buildDataQualitySummary({
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

  return useMemo(
    () => ({
      qualitySummary,
      scopedFundQuality,
      scopedManualPriceOverrides,
      scopedPipelineErrors,
    }),
    [
      qualitySummary,
      scopedFundQuality,
      scopedManualPriceOverrides,
      scopedPipelineErrors,
    ],
  )
}

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
