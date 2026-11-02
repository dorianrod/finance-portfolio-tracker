import { useMemo } from 'react'

import { applyPositionFilters } from '@/domains/portfolio/shared/helpers/transformers/applyPositionFilters'
import { buildPositionRows } from '@/domains/portfolio/shared/helpers/transformers/buildPositionHierarchy/buildPositionRows'
import { selectHistoricalFundHoldingsAtDate } from '@/domains/portfolio/shared/helpers/transformers/historicalFundHoldings/selectHistoricalFundHoldingsAtDate'
import { withoutOperationAndPeriodFilters } from '@/domains/portfolio/shared/helpers/transformers/portfolioFilterScopes/withoutOperationAndPeriodFilters'
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
  return useMemo(
    () => ({
      currentPositions,
      latestAccountPositions,
      periodEndFundHoldings,
      positionsAtPeriodEnd,
      tableFiltered,
    }),
    [
      currentPositions,
      latestAccountPositions,
      periodEndFundHoldings,
      positionsAtPeriodEnd,
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
