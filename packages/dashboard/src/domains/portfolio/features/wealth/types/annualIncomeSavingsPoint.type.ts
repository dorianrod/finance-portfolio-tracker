export type AnnualIncomeSavingsPoint = {
  year: number
  incomeStatus: 'actual' | 'forecast'
  netSalary: number
  otherIncome: number
  totalIncome: number
  grossSalary: number
  // No annual savings snapshot exists for an uncovered year.
  placedSavings: number | null
  // The savings source may omit its last covered date.
  savingsThrough: Date | null
  savingsStatus: 'complete' | 'partial' | 'missing'
  // Forecast, partial or zero-income years may not be comparable.
  placementRate: number | null
  // A proxy cannot be computed when savings and income are not comparable.
  unplacedIncomeProxy: number | null
  comparable: boolean
}
