import { useMemo } from 'react'

import { buildAccountTypeBreakdown } from '@/domains/portfolio/features/wealth/helpers/transformers/buildAccountTypeBreakdown'
import { filterAnnualIncomeSavingsByPeriod } from '@/domains/portfolio/features/wealth/helpers/transformers/filterAnnualIncomeSavingsByPeriod'
import { filterMonthlyOpsByAccounts } from '@/domains/portfolio/features/wealth/helpers/transformers/filterMonthlyOpsByAccounts'
import { buildCumulativeWealthDrivers } from '@/domains/portfolio/features/wealth/helpers/transformers/wealthCalculations/buildCumulativeWealthDrivers'
import { computeTrailing12mSavings } from '@/domains/portfolio/features/wealth/helpers/transformers/wealthCalculations/computeTrailing12mSavings'
import { computeTrailing12mYearOverYear } from '@/domains/portfolio/features/wealth/helpers/transformers/wealthCalculations/computeTrailing12mYearOverYear'
import { useAccountTypeHistory } from '@/domains/portfolio/features/wealth/services/useAccountTypeHistory'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/types/annualIncomeSavingsPoint.type'
import type { MonthlyOperationsByMonth } from '@/domains/portfolio/features/wealth/types/monthlyOperation.type'
import { filterPointsByPeriod } from '@/domains/portfolio/shared/helpers/transformers/filterPointsByPeriod'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
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
