import type {
  AnnualIncomeSavingsPoint,
  IncomePlacementAnalysis,
} from './mapAnnualIncomeSavings.types'

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
