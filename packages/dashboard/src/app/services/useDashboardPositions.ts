import { selectHistoricalFundHoldingsAtDate } from '@/domains/portfolio/shared/helpers/calculators/buildConcentrationTrend'
import {
  applyPositionFilters,
  sortPositionsForTable,
} from '@/domains/portfolio/shared/helpers/filters/portfolioDataFilters'
import {
  withoutOperationAndPeriodFilters,
  withoutOperationFilters,
} from '@/domains/portfolio/shared/helpers/filters/portfolioFilterScopes'
import { buildPositionRows } from '@/domains/portfolio/shared/helpers/mappers/buildPositionHierarchy'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import type { FundHoldingsData } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import type { PositionSortKey } from '@/domains/portfolio/shared/types/positionSort.type'
import type { RawOperation } from '@/domains/portfolio/shared/types/rawOperation.type'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'
import { useMemo } from 'react'

type DashboardPositionsInput = {
  allAccountTypes: string[]
  filters: DashboardFilters
  fundData: FundHoldingsData
  positions: PositionRow[]
  rawOperations: RawOperation[]
  rawPositions: RawPosition[]
  sortDirection: 'asc' | 'desc'
  sortKey: PositionSortKey
}

export function useDashboardPositions({
  allAccountTypes,
  filters,
  fundData,
  positions,
  rawOperations,
  rawPositions,
  sortDirection,
  sortKey,
}: DashboardPositionsInput) {
  const currentFilters = useMemo(() => withoutOperationAndPeriodFilters(filters), [filters])
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
    () => applyPositionFilters(positionsAtPeriodEnd, withoutOperationFilters(filters)),
    [filters, positionsAtPeriodEnd],
  )
  const tableData = useMemo(
    () =>
      sortPositionsForTable(
        tableFiltered,
        filters.hideClosedPositions,
        allAccountTypes,
        sortKey,
        sortDirection,
      ),
    [allAccountTypes, filters.hideClosedPositions, sortDirection, sortKey, tableFiltered],
  )

  return useMemo(
    () => ({
      currentPositions,
      latestAccountPositions,
      periodEndFundHoldings,
      periodPositions,
      tableData,
      tableFiltered,
    }),
    [
      currentPositions,
      latestAccountPositions,
      periodEndFundHoldings,
      periodPositions,
      tableData,
      tableFiltered,
    ],
  )
}
