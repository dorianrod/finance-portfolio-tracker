import { array, mixed, type Schema } from 'yup'

import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/types/annualIncomeSavingsPoint.type'

import { RAW_ANNUAL_INCOME_SAVINGS_SCHEMA } from './rawAnnualIncomeSavingsSchema'
export const ANNUAL_INCOME_SAVINGS_SCHEMA: Schema<AnnualIncomeSavingsPoint[]> =
  mixed<AnnualIncomeSavingsPoint[]>()
    .transform(
      (_value: unknown, original: unknown): AnnualIncomeSavingsPoint[] => {
        const rows = array(RAW_ANNUAL_INCOME_SAVINGS_SCHEMA)
          .defined()
          .validateSync(original, { stripUnknown: true })
        return rows
          .map((row) => ({
            year: row.year,
            incomeStatus: row.income_status,
            netSalary: row.net_salary,
            otherIncome: row.other_income,
            totalIncome: row.total_income,
            grossSalary: row.gross_salary,
            placedSavings: row.placed_savings,
            savingsThrough: row.savings_through,
            savingsStatus: row.savings_status,
            placementRate: row.placement_rate,
            unplacedIncomeProxy: row.unplaced_income_proxy,
            comparable: row.comparable,
          }))
          .filter((point) => point.year > 0)
          .toSorted((a, b) => a.year - b.year)
      },
    )
    .defined()
