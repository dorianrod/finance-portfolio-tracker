import { useMemo } from 'react'
import { useSavingCapacity } from '@/domains/portfolio/shared/apis/queries/useSavingCapacity'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'
import type { HistoricalFundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { MonthlyOperationsByMonth } from '@/domains/portfolio/shared/types/monthlyOperation.type'
import { useAccountTypeHistory } from '@/domains/portfolio/shared/services/useAccountTypeHistory'
import {
  buildCumulativeWealthDrivers,
  computeTrailing12mSavings,
  computeTrailing12mYearOverYear,
  filterMonthlyOpsByAccounts,
  filterPointsByPeriod,
} from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import {
  buildOverviewComparison,
  compareRollingThreeYearIrr,
} from '@/domains/portfolio/shared/helpers/calculators/buildOverviewComparison'
import { buildAccountTypeBreakdown } from '@/domains/portfolio/shared/helpers/filters/portfolioDataFilters'
import {
  filterAnnualIncomeSavingsByPeriod,
  type AnnualIncomeSavingsPoint,
} from '@/domains/portfolio/shared/helpers/mappers/mapAnnualIncomeSavings'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import type { RawOperation } from '@/domains/portfolio/shared/types/rawOperation.type'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

const EMPTY_SAVING_CAPACITY: SavingCapacityPoint[] = []

type DashboardWealthInput = {
  accountHistory: PortfolioHistoryPoint[]
  allMonthlyOps: MonthlyOperationsByMonth
  annualIncomeSavings: AnnualIncomeSavingsPoint[]
  currentPositions: PositionRow[]
  filters: DashboardFilters
  fundHoldingsHistory: HistoricalFundHolding[]
  rawOperations: RawOperation[]
  rawPositions: RawPosition[]
}

export function useDashboardWealth({
  accountHistory,
  allMonthlyOps,
  annualIncomeSavings,
  currentPositions,
  filters,
  fundHoldingsHistory,
  rawOperations,
  rawPositions,
}: DashboardWealthInput) {
  const savingCapacityQuery = useSavingCapacity(filters.accounts)
  const savingCapacity = savingCapacityQuery.data ?? EMPTY_SAVING_CAPACITY
  const overviewComparison = useMemo(
    () => buildOverviewComparison({
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
    () => overviewComparison
      ? compareRollingThreeYearIrr(accountHistory, overviewComparison.windows)
      : { current: null, previous: null, delta: null, deltaPct: null },
    [accountHistory, overviewComparison],
  )
  const periodSavings = useMemo(
    () => filterPointsByPeriod(savingCapacity, filters.dateFrom, filters.dateTo),
    [filters.dateFrom, filters.dateTo, savingCapacity],
  )
  const trailingSavings = useMemo(
    () => computeTrailing12mSavings(savingCapacity, filters.dateFrom, filters.dateTo),
    [filters.dateFrom, filters.dateTo, savingCapacity],
  )
  const trailingYearComparison = useMemo(
    () => computeTrailing12mYearOverYear(savingCapacity, filters.dateTo),
    [filters.dateTo, savingCapacity],
  )
  const wealthDrivers = useMemo(
    () => buildCumulativeWealthDrivers(periodSavings),
    [periodSavings],
  )
  const monthlyOps = useMemo(
    () => filterMonthlyOpsByAccounts(allMonthlyOps, filters.accounts),
    [allMonthlyOps, filters.accounts],
  )
  const typeHistory = useAccountTypeHistory(filters.accounts)
  const displayedTypeHistory = useMemo(
    () => filterPointsByPeriod(typeHistory.data, filters.dateFrom, filters.dateTo),
    [filters.dateFrom, filters.dateTo, typeHistory.data],
  )
  const accountTypeData = useMemo(
    () => buildAccountTypeBreakdown(currentPositions),
    [currentPositions],
  )
  const displayedAnnualIncomeSavings = useMemo(
    () => filterAnnualIncomeSavingsByPeriod(
      annualIncomeSavings,
      filters.dateFrom,
      filters.dateTo,
    ),
    [annualIncomeSavings, filters.dateFrom, filters.dateTo],
  )

  return {
    accountTypeData,
    displayedAnnualIncomeSavings,
    displayedTypeHistory,
    monthlyOps,
    overviewComparison,
    rollingThreeYearTriComparison,
    trailingSavings,
    trailingYearComparison,
    typeHistory,
    wealthDrivers,
  }
}
