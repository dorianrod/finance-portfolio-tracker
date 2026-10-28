import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/types/annualIncomeSavingsPoint.type'
import type { RawAnnualIncomeSavingsRow } from '@/domains/portfolio/features/wealth/types/rawAnnualIncomeSavingsRow.type'

export function mapAnnualIncomeSavings(
  rows: RawAnnualIncomeSavingsRow[],
): AnnualIncomeSavingsPoint[] {
  return rows
    .map((row) => ({
      year: Math.trunc(row.year),
      incomeStatus: row.income_status,
      netSalary: row.net_salary,
      otherIncome: row.other_income,
      totalIncome: row.total_income,
      grossSalary: row.gross_salary,
      placedSavings: row.placed_savings,
      savingsThrough: row.savings_through || null,
      savingsStatus: row.savings_status,
      placementRate: row.placement_rate,
      unplacedIncomeProxy: row.unplaced_income_proxy,
      comparable: row.comparable,
    }))
    .filter((point) => point.year > 0)
    .toSorted((a, b) => a.year - b.year)
}
