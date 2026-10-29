import { useMemo } from 'react'

import { buildOverviewComparison } from '@/domains/portfolio/features/overview/helpers/calculators/buildOverviewComparison/buildOverviewComparison'
import { compareRollingThreeYearIrr } from '@/domains/portfolio/features/overview/helpers/calculators/buildOverviewComparison/compareRollingThreeYearIrr'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import type { HistoricalFundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import type { RawOperation } from '@/domains/portfolio/shared/types/rawOperation.type'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

export function useOverviewComparison({
  accountHistory,
  filters,
  fundHoldingsHistory,
  rawOperations,
  rawPositions,
  savingCapacity,
}: OverviewComparisonInput) {
  const overviewComparison = useMemo(
    () =>
      buildOverviewComparison({
        rawPositions,
        rawOperations,
        savingCapacity,
        fundHoldingsHistory,
        accountFilters: filters.accounts,
        accountTypeFilters: filters.accountTypes,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      }),
    [
      filters.accountTypes,
      filters.accounts,
      filters.dateFrom,
      filters.dateTo,
      fundHoldingsHistory,
      rawOperations,
      rawPositions,
      savingCapacity,
    ],
  )
  const rollingThreeYearTriComparison = useMemo(
    () =>
      overviewComparison
        ? compareRollingThreeYearIrr(accountHistory, overviewComparison.windows)
        : { current: null, previous: null, delta: null, deltaPct: null },
    [accountHistory, overviewComparison],
  )
  return useMemo(
    () => ({ overviewComparison, rollingThreeYearTriComparison }),
    [overviewComparison, rollingThreeYearTriComparison],
  )
}

type OverviewComparisonInput = {
  accountHistory: PortfolioHistoryPoint[]
  filters: DashboardFilters
  fundHoldingsHistory: HistoricalFundHolding[]
  rawOperations: RawOperation[]
  rawPositions: RawPosition[]
  savingCapacity: SavingCapacityPoint[]
}
