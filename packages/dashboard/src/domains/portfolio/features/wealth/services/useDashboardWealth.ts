import { useMemo } from 'react'

import { buildAccountTypeBreakdown } from '@/domains/portfolio/features/wealth/helpers/aggregators/buildAccountTypeBreakdown'
import {
  buildCumulativeWealthDrivers,
  computeTrailing12mSavings,
  computeTrailing12mYearOverYear,
  filterMonthlyOpsByAccounts,
} from '@/domains/portfolio/features/wealth/helpers/calculators/wealthCalculations'
import { useAccountTypeHistory } from '@/domains/portfolio/features/wealth/services/useAccountTypeHistory'
import { filterPointsByPeriod } from '@/domains/portfolio/shared/helpers/filters/filterPointsByPeriod'
import {
  type AnnualIncomeSavingsPoint,
  filterAnnualIncomeSavingsByPeriod,
} from '@/domains/portfolio/shared/helpers/mappers/mapAnnualIncomeSavings'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import type { MonthlyOperationsByMonth } from '@/domains/portfolio/shared/types/monthlyOperation.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

export function useDashboardWealth({
  savingCapacity,
  allMonthlyOps,
  annualIncomeSavings,
  currentPositions,
  filters,
}: DashboardWealthInput) {
  const periodSavings = useMemo(
    () =>
      filterPointsByPeriod(savingCapacity, filters.dateFrom, filters.dateTo),
    [filters.dateFrom, filters.dateTo, savingCapacity],
  )
  const trailingSavings = useMemo(
    () =>
      computeTrailing12mSavings(
        savingCapacity,
        filters.dateFrom,
        filters.dateTo,
      ),
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
    () =>
      filterPointsByPeriod(typeHistory.data, filters.dateFrom, filters.dateTo),
    [filters.dateFrom, filters.dateTo, typeHistory.data],
  )
  const accountTypeData = useMemo(
    () => buildAccountTypeBreakdown(currentPositions),
    [currentPositions],
  )
  const displayedAnnualIncomeSavings = useMemo(
    () =>
      filterAnnualIncomeSavingsByPeriod(
        annualIncomeSavings,
        filters.dateFrom,
        filters.dateTo,
      ),
    [annualIncomeSavings, filters.dateFrom, filters.dateTo],
  )

  return useMemo(
    () => ({
      accountTypeData,
      displayedAnnualIncomeSavings,
      displayedTypeHistory,
      monthlyOps,
      trailingSavings,
      trailingYearComparison,
      typeHistory,
      wealthDrivers,
    }),
    [
      accountTypeData,
      displayedAnnualIncomeSavings,
      displayedTypeHistory,
      monthlyOps,
      trailingSavings,
      trailingYearComparison,
      typeHistory,
      wealthDrivers,
    ],
  )
}

type DashboardWealthInput = {
  savingCapacity: SavingCapacityPoint[]
  allMonthlyOps: MonthlyOperationsByMonth
  annualIncomeSavings: AnnualIncomeSavingsPoint[]
  currentPositions: PositionRow[]
  filters: DashboardFilters
}
