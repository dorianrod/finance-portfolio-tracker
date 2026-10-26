export type RawAnnualIncomeSavingsRow = {
  year: number
  income_status: AnnualIncomeSavingsPoint['incomeStatus']
  net_salary: number
  other_income: number
  total_income: number
  gross_salary: number
  placed_savings: number | null
  savings_through: Date | null
  savings_status: AnnualIncomeSavingsPoint['savingsStatus']
  placement_rate: number | null
  unplaced_income_proxy: number | null
  comparable: boolean
}

export type AnnualIncomeSavingsPoint = {
  year: number
  incomeStatus: 'actual' | 'forecast'
  netSalary: number
  otherIncome: number
  totalIncome: number
  grossSalary: number
  placedSavings: number | null
  savingsThrough: Date | null
  savingsStatus: 'complete' | 'partial' | 'missing'
  placementRate: number | null
  unplacedIncomeProxy: number | null
  comparable: boolean
}

export type IncomePlacementAnalysis = {
  points: AnnualIncomeSavingsPoint[]
  correlation: number | null
  slopePerTenThousand: number | null
  trendLine: Array<{ totalIncome: number; placementRate: number }>
}
