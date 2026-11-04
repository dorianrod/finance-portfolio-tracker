import type { AnnualIncomeSavingsPoint } from './annualIncomeSavingsPoint.type'

// Validated CSV rows retain export column names; display points use camelCase.
export type RawAnnualIncomeSavingsRow = {
  year: number
  income_status: AnnualIncomeSavingsPoint['incomeStatus']
  net_salary: number
  other_income: number
  total_income: number
  gross_salary: number
  // The CSV may have no savings coverage for this year.
  placed_savings: number | null
  // The export may have no savings coverage date.
  savings_through: Date | null
  savings_status: AnnualIncomeSavingsPoint['savingsStatus']
  // The export leaves this empty for non-comparable years.
  placement_rate: number | null
  // The export leaves this empty when income and savings cannot be compared.
  unplaced_income_proxy: number | null
  comparable: boolean
}
