import { useCallback, useMemo } from 'react'

import { aggregateAllocationPoints } from '@/domains/portfolio/features/diversification/features/allocation/helpers/calculators/allocationChartCalculations/aggregateAllocationPoints'
import { aggregateFilteredPoints } from '@/domains/portfolio/features/diversification/features/allocation/helpers/calculators/allocationChartCalculations/aggregateFilteredPoints'
import { computeMatchingIsins } from '@/domains/portfolio/features/diversification/features/allocation/helpers/calculators/allocationChartCalculations/computeMatchingIsins'
import { computeTableRows } from '@/domains/portfolio/features/diversification/features/allocation/helpers/calculators/allocationChartCalculations/computeTableRows'
import type { AllocationFilter } from '@/domains/portfolio/features/diversification/features/allocation/types/allocationChart.type'
import { filterPointsByPeriod } from '@/domains/portfolio/shared/helpers/filters/filterPointsByPeriod'
import type { RawIsinData } from '@/domains/portfolio/shared/types/rawIsinData.type'

export function useAllocationCharts({
  activeFilter,
  rawData,
  dateFrom,
  dateTo,
}: UseAllocationChartsInput) {
  const baseGeo = useMemo(
    () => aggregateAllocationPoints(rawData.geo),
    [rawData.geo],
  )
  const baseSecteur = useMemo(
    () => aggregateAllocationPoints(rawData.secteur),
    [rawData.secteur],
  )
  const baseCurrency = useMemo(
    () => aggregateAllocationPoints(rawData.currency),
    [rawData.currency],
  )
  const baseClasse = useMemo(
    () => aggregateAllocationPoints(rawData.classe),
    [rawData.classe],
  )
  const matchingIsins = useMemo(
    () => computeMatchingIsins(rawData, activeFilter, dateTo),
    [rawData, activeFilter, dateTo],
  )

  const displayPoints = useCallback(
    <
      T extends keyof Pick<
        RawIsinData,
        'geo' | 'secteur' | 'currency' | 'classe'
      >,
    >(
      dimension: T,
      basePoints: ReturnType<typeof aggregateAllocationPoints>,
    ) => {
      if (!activeFilter || rawData.loading) return basePoints
      const points = aggregateFilteredPoints(
        rawData[dimension],
        matchingIsins,
        activeFilter.type === dimension ? activeFilter.value : undefined,
      )
      return points.length > 0 ? points : basePoints
    },
    [activeFilter, matchingIsins, rawData],
  )

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
    () =>
      !activeFilter || rawData.loading
        ? []
        : computeTableRows(rawData, matchingIsins, activeFilter, dateTo),
    [activeFilter, rawData, matchingIsins, dateTo],
  )
  const latestGeo = latestAsOf(displayGeo, dateTo)
  const latestSecteur = latestAsOf(displaySecteur, dateTo)
  const latestCurrency = latestAsOf(displayCurrency, dateTo)
  const latestClasse = latestAsOf(displayClasse, dateTo)
  const trendGeo = useMemo(
    () => filterPointsByPeriod(displayGeo, dateFrom, dateTo),
    [displayGeo, dateFrom, dateTo],
  )
  const trendSecteur = useMemo(
    () => filterPointsByPeriod(displaySecteur, dateFrom, dateTo),
    [displaySecteur, dateFrom, dateTo],
  )
  const trendCurrency = useMemo(
    () => filterPointsByPeriod(displayCurrency, dateFrom, dateTo),
    [displayCurrency, dateFrom, dateTo],
  )
  const trendClasse = useMemo(
    () => filterPointsByPeriod(displayClasse, dateFrom, dateTo),
    [displayClasse, dateFrom, dateTo],
  )
  const hasEvolution =
    Math.max(
      trendGeo.length,
      trendSecteur.length,
      trendCurrency.length,
      trendClasse.length,
    ) >= 2

  return useMemo(
    () => ({
      baseClasse,
      baseCurrency,
      baseGeo,
      baseSecteur,
      hasEvolution,
      latestClasse,
      latestCurrency,
      latestGeo,
      latestSecteur,
      tableRows,
      trendClasse,
      trendCurrency,
      trendGeo,
      trendSecteur,
    }),
    [
      baseClasse,
      baseCurrency,
      baseGeo,
      baseSecteur,
      hasEvolution,
      latestClasse,
      latestCurrency,
      latestGeo,
      latestSecteur,
      tableRows,
      trendClasse,
      trendCurrency,
      trendGeo,
      trendSecteur,
    ],
  )
}

type UseAllocationChartsInput = {
  activeFilter: AllocationFilter | null
  rawData: RawIsinData
  dateFrom?: Date
  dateTo?: Date
}

function latestAsOf<T extends { date: Date }>(
  points: T[],
  dateTo?: Date,
): T | undefined {
  return points.filter((point) => !dateTo || point.date <= dateTo).at(-1)
}
