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

export function filterAnnualIncomeSavingsByPeriod(
  points: AnnualIncomeSavingsPoint[],
  dateFrom?: Date,
  dateTo?: Date,
): AnnualIncomeSavingsPoint[] {
  const fromYear = dateFrom ? Number(String(dateFrom.getUTCFullYear())) : null
  const toYear = dateTo ? Number(String(dateTo.getUTCFullYear())) : null
  return points.filter(
    (point) =>
      (fromYear == null || point.year >= fromYear) &&
      (toYear == null || point.year <= toYear),
  )
}

export function analyseIncomePlacement(
  data: AnnualIncomeSavingsPoint[],
): IncomePlacementAnalysis {
  const points = data.filter(
    (point) =>
      point.comparable &&
      point.incomeStatus === 'actual' &&
      point.savingsStatus === 'complete' &&
      point.placementRate !== null,
  )
  if (points.length < 2) {
    return {
      points,
      correlation: null,
      slopePerTenThousand: null,
      trendLine: [],
    }
  }

  const meanIncome =
    points.reduce((sum, point) => sum + point.totalIncome, 0) / points.length
  const meanRate =
    points.reduce((sum, point) => sum + point.placementRate!, 0) / points.length
  const covariance = points.reduce(
    (sum, point) =>
      sum +
      (point.totalIncome - meanIncome) * (point.placementRate! - meanRate),
    0,
  )
  const incomeVariance = points.reduce(
    (sum, point) => sum + (point.totalIncome - meanIncome) ** 2,
    0,
  )
  const rateVariance = points.reduce(
    (sum, point) => sum + (point.placementRate! - meanRate) ** 2,
    0,
  )

  if (incomeVariance === 0 || rateVariance === 0) {
    return {
      points,
      correlation: null,
      slopePerTenThousand: null,
      trendLine: [],
    }
  }

  const slope = covariance / incomeVariance
  const intercept = meanRate - slope * meanIncome
  const correlation = covariance / Math.sqrt(incomeVariance * rateVariance)
  const minIncome = Math.min(...points.map((point) => point.totalIncome))
  const maxIncome = Math.max(...points.map((point) => point.totalIncome))

  return {
    points,
    correlation,
    slopePerTenThousand: slope * 10_000,
    trendLine: [minIncome, maxIncome].map((totalIncome) => ({
      totalIncome,
      placementRate: intercept + slope * totalIncome,
    })),
  }
}
