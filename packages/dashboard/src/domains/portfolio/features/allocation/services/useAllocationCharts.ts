import { useCallback, useMemo } from 'react'
import type { RawIsinData } from '@/domains/portfolio/shared/apis/queries/useRawIsinData'
import type {
  FundHolding,
  HistoricalFundHolding,
} from '@/domains/portfolio/shared/apis/queries/useFundHoldings'
import {
  aggregateAllocationPoints,
  aggregateFilteredPoints,
  computeMatchingIsins,
  computeTableRows,
  excludeNonApplicableAllocationData,
  scopeRawAllocationData,
} from '@/domains/portfolio/features/allocation/helpers/calculators/allocationChartCalculations'
import type { AllocationFilter } from '@/domains/portfolio/shared/types/allocationCharts.types'
import {
  buildHistoricalConcentration,
  buildHistoricalLookThroughConcentration,
} from '@/domains/portfolio/shared/helpers/calculators/buildConcentrationTrend'
import {
  buildCumulativeConcentration,
  computeConcentration,
  computeHeldAssetConcentration,
  filterPointsByPeriod,
} from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import type { ConcentrationMode } from '@/domains/portfolio/shared/components/ConcentrationModeToggle.view'
import { isAssetAnalysisApplicablePosition } from '@/domains/portfolio/shared/helpers/quality/accountApplicability'
import type { PositionRow, RawPosition } from '@/domains/portfolio/shared/types/domain'

interface UseAllocationChartsInput {
  positions: PositionRow[]
  rawPositions: RawPosition[]
  fundHoldings: FundHolding[]
  fundHoldingsHistory: HistoricalFundHolding[]
  accountFilters: Set<string>
  accountTypeFilters: Set<string>
  activeFilter: AllocationFilter | null
  concentrationMode: ConcentrationMode
  rawData: RawIsinData
  dateFrom?: string
  dateTo?: string
}

function latestAsOf<T extends { date: string }>(points: T[], dateTo?: string): T | undefined {
  return points.filter((point) => !dateTo || point.date <= dateTo).at(-1)
}

export function useAllocationCharts({
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
}: UseAllocationChartsInput) {
  const applicablePositions = useMemo(
    () => positions.filter(isAssetAnalysisApplicablePosition),
    [positions],
  )
  const hasSelectedValue = positions.some(
    (position) => position.status === 'active' && (position.total_value ?? 0) > 0,
  )
  const hasApplicableValue = applicablePositions.some(
    (position) => position.status === 'active' && (position.total_value ?? 0) > 0,
  )
  const lookThroughConcentration = useMemo(
    () => computeConcentration(applicablePositions, fundHoldings),
    [applicablePositions, fundHoldings],
  )
  const heldAssetConcentration = useMemo(
    () => computeHeldAssetConcentration(applicablePositions),
    [applicablePositions],
  )
  const concentration = concentrationMode === 'held'
    ? heldAssetConcentration
    : lookThroughConcentration
  const cumulativeConcentration = useMemo(
    () => buildCumulativeConcentration(concentration.allHoldings),
    [concentration],
  )
  const heldConcentrationHistory = useMemo(
    () => filterPointsByPeriod(
      buildHistoricalConcentration(rawPositions, accountFilters, accountTypeFilters),
      dateFrom,
      dateTo,
    ),
    [rawPositions, accountFilters, accountTypeFilters, dateFrom, dateTo],
  )
  const lookThroughConcentrationHistory = useMemo(
    () => filterPointsByPeriod(
      buildHistoricalLookThroughConcentration(
        rawPositions,
        fundHoldingsHistory,
        accountFilters,
        accountTypeFilters,
      ),
      dateFrom,
      dateTo,
    ),
    [
      rawPositions,
      fundHoldingsHistory,
      accountFilters,
      accountTypeFilters,
      dateFrom,
      dateTo,
    ],
  )
  const scopedRawData = useMemo(
    () => excludeNonApplicableAllocationData(
      scopeRawAllocationData(rawData, accountFilters),
      positions,
    ),
    [rawData, accountFilters, positions],
  )
  const baseGeo = useMemo(
    () => aggregateAllocationPoints(scopedRawData.geo),
    [scopedRawData.geo],
  )
  const baseSecteur = useMemo(
    () => aggregateAllocationPoints(scopedRawData.secteur),
    [scopedRawData.secteur],
  )
  const baseCurrency = useMemo(
    () => aggregateAllocationPoints(scopedRawData.currency),
    [scopedRawData.currency],
  )
  const baseClasse = useMemo(
    () => aggregateAllocationPoints(scopedRawData.classe),
    [scopedRawData.classe],
  )
  const matchingIsins = useMemo(
    () => computeMatchingIsins(scopedRawData, activeFilter, dateTo),
    [scopedRawData, activeFilter, dateTo],
  )

  const displayPoints = useCallback(<T extends keyof Pick<RawIsinData, 'geo' | 'secteur' | 'currency' | 'classe'>>(
    dimension: T,
    basePoints: ReturnType<typeof aggregateAllocationPoints>,
  ) => {
    if (!activeFilter || scopedRawData.loading) return basePoints
    const points = aggregateFilteredPoints(
      scopedRawData[dimension],
      matchingIsins,
      activeFilter.type === dimension ? activeFilter.value : undefined,
    )
    return points.length > 0 ? points : basePoints
  }, [activeFilter, matchingIsins, scopedRawData])

  const displayGeo = useMemo(
    () => displayPoints('geo', baseGeo),
    [displayPoints, baseGeo],
  )
  const displaySecteur = useMemo(
    () => displayPoints('secteur', baseSecteur),
    [displayPoints, baseSecteur],
  )
  const displayCurrency = useMemo(
    () => displayPoints('currency', baseCurrency),
    [displayPoints, baseCurrency],
  )
  const displayClasse = useMemo(
    () => displayPoints('classe', baseClasse),
    [displayPoints, baseClasse],
  )
  const tableRows = useMemo(
    () => !activeFilter || scopedRawData.loading
      ? []
      : computeTableRows(scopedRawData, matchingIsins, activeFilter, dateTo),
    [activeFilter, scopedRawData, matchingIsins, dateTo],
  )
  const latestGeo = latestAsOf(displayGeo, dateTo)
  const latestSecteur = latestAsOf(displaySecteur, dateTo)
  const latestCurrency = latestAsOf(displayCurrency, dateTo)
  const latestClasse = latestAsOf(displayClasse, dateTo)
  const trendGeo = filterPointsByPeriod(displayGeo, dateFrom, dateTo)
  const trendSecteur = filterPointsByPeriod(displaySecteur, dateFrom, dateTo)
  const trendCurrency = filterPointsByPeriod(displayCurrency, dateFrom, dateTo)
  const trendClasse = filterPointsByPeriod(displayClasse, dateFrom, dateTo)
  const hasEvolution = Math.max(
    trendGeo.length,
    trendSecteur.length,
    trendCurrency.length,
    trendClasse.length,
  ) >= 2

  return {
    baseClasse,
    baseCurrency,
    baseGeo,
    baseSecteur,
    concentration,
    cumulativeConcentration,
    hasApplicableValue,
    hasEvolution,
    hasSelectedValue,
    heldAssetConcentration,
    heldConcentrationHistory,
    latestClasse,
    latestCurrency,
    latestGeo,
    latestSecteur,
    lookThroughConcentration,
    lookThroughConcentrationHistory,
    tableRows,
    trendClasse,
    trendCurrency,
    trendGeo,
    trendSecteur,
  }
}
