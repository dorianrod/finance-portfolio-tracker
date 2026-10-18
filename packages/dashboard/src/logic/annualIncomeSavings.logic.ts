import { parseNum } from '@/shared/csv/parseNum'

export interface RawAnnualIncomeSavingsRow {
  year: string
  income_status: string
  net_salary: string
  other_income: string
  total_income: string
  gross_salary: string
  placed_savings: string
  savings_through: string
  savings_status: string
  placement_rate: string
  unplaced_income_proxy: string
  comparable: string
}

export interface AnnualIncomeSavingsPoint {
  year: number
  incomeStatus: 'actual' | 'forecast'
  netSalary: number
  otherIncome: number
  totalIncome: number
  grossSalary: number
  placedSavings: number | null
  savingsThrough: string | null
  savingsStatus: 'complete' | 'partial' | 'missing'
  placementRate: number | null
  unplacedIncomeProxy: number | null
  comparable: boolean
}

export interface IncomePlacementAnalysis {
  points: AnnualIncomeSavingsPoint[]
  correlation: number | null
  slopePerTenThousand: number | null
  trendLine: Array<{ totalIncome: number; placementRate: number }>
}

function parseRequired(value: string): number {
  return parseNum(value) ?? 0
}

export function mapAnnualIncomeSavings(
  rows: RawAnnualIncomeSavingsRow[],
): AnnualIncomeSavingsPoint[] {
  return rows
    .map((row) => ({
      year: Math.trunc(parseRequired(row.year)),
      incomeStatus: row.income_status === 'forecast' ? 'forecast' as const : 'actual' as const,
      netSalary: parseRequired(row.net_salary),
      otherIncome: parseRequired(row.other_income),
      totalIncome: parseRequired(row.total_income),
      grossSalary: parseRequired(row.gross_salary),
      placedSavings: parseNum(row.placed_savings),
      savingsThrough: row.savings_through || null,
      savingsStatus: row.savings_status === 'complete'
        ? 'complete' as const
        : row.savings_status === 'partial' ? 'partial' as const : 'missing' as const,
      placementRate: parseNum(row.placement_rate),
      unplacedIncomeProxy: parseNum(row.unplaced_income_proxy),
      comparable: row.comparable.toLowerCase() === 'true',
    }))
    .filter((point) => point.year > 0)
    .sort((a, b) => a.year - b.year)
}

export function analyseIncomePlacement(
  data: AnnualIncomeSavingsPoint[],
): IncomePlacementAnalysis {
  const points = data.filter(
    (point) => point.comparable
      && point.incomeStatus === 'actual'
      && point.savingsStatus === 'complete'
      && point.placementRate !== null,
  )
  if (points.length < 2) {
    return {
      points,
      correlation: null,
      slopePerTenThousand: null,
      trendLine: [],
    }
  }

  const meanIncome = points.reduce((sum, point) => sum + point.totalIncome, 0) / points.length
  const meanRate = points.reduce((sum, point) => sum + point.placementRate!, 0) / points.length
  const covariance = points.reduce(
    (sum, point) => sum + (point.totalIncome - meanIncome) * (point.placementRate! - meanRate),
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
