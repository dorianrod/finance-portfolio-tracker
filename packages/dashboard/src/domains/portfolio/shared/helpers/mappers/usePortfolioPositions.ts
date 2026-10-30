// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; The shell supplies this common position snapshot and account scope to holdings, wealth, performance and quality. See SHARED_OWNERSHIP_AUDIT.md.
import { useMemo } from 'react'

import { withoutOperationAndPeriodFilters } from '@/domains/portfolio/shared/helpers/filters/portfolioFilterScopes/withoutOperationAndPeriodFilters'
import { withoutOperationFilters } from '@/domains/portfolio/shared/helpers/filters/portfolioFilterScopes/withoutOperationFilters'
import { buildPositionRows } from '@/domains/portfolio/shared/helpers/mappers/buildPositionHierarchy/buildPositionRows'
import { applyPositionFilters } from '@/domains/portfolio/shared/helpers/selectors/applyPositionFilters'
import { selectHistoricalFundHoldingsAtDate } from '@/domains/portfolio/shared/helpers/selectors/historicalFundHoldings/selectHistoricalFundHoldingsAtDate'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import type { FundHoldingsData } from '@/domains/portfolio/shared/types/fundHoldingsData.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import type { RawOperation } from '@/domains/portfolio/shared/types/rawOperation.type'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'

export function usePortfolioPositions({
  filters,
  fundData,
  positions,
  rawOperations,
  rawPositions,
}: DashboardPositionsInput) {
  const currentFilters = useMemo(
    () => withoutOperationAndPeriodFilters(filters),
    [filters],
  )
  const latestAccountPositions = useMemo(
    () => applyPositionFilters(positions, currentFilters),
    [currentFilters, positions],
  )
  const positionsAtPeriodEnd = useMemo(
    () => buildPositionRows(rawOperations, rawPositions, filters.dateTo),
    [filters.dateTo, rawOperations, rawPositions],
  )
  const currentPositions = useMemo(
    () => applyPositionFilters(positionsAtPeriodEnd, currentFilters),
    [currentFilters, positionsAtPeriodEnd],
  )
  const periodEndFundHoldings = useMemo(
    () =>
      filters.dateTo
        ? selectHistoricalFundHoldingsAtDate(fundData.history, filters.dateTo)
        : fundData.holdings,
    [filters.dateTo, fundData.history, fundData.holdings],
  )
  const tableFiltered = useMemo(
    () => applyPositionFilters(positionsAtPeriodEnd, filters),
    [filters, positionsAtPeriodEnd],
  )
  const periodPositions = useMemo(
    () =>
      applyPositionFilters(
        positionsAtPeriodEnd,
        withoutOperationFilters(filters),
      ),
    [filters, positionsAtPeriodEnd],
  )

  return useMemo(
    () => ({
      currentPositions,
      latestAccountPositions,
      periodEndFundHoldings,
      periodPositions,
      tableFiltered,
    }),
    [
      currentPositions,
      latestAccountPositions,
      periodEndFundHoldings,
      periodPositions,
      tableFiltered,
    ],
  )
}

type DashboardPositionsInput = {
  filters: DashboardFilters
  fundData: FundHoldingsData
  positions: PositionRow[]
  rawOperations: RawOperation[]
  rawPositions: RawPosition[]
}
