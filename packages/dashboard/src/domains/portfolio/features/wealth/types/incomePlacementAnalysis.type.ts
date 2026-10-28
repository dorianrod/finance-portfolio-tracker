import type { AnnualIncomeSavingsPoint } from './annualIncomeSavingsPoint.type'

export type IncomePlacementAnalysis = {
  points: AnnualIncomeSavingsPoint[]
  // Insufficient pairs or constant values do not define a correlation.
  correlation: number | null
  // Insufficient pairs or constant income do not define a slope.
  slopePerTenThousand: number | null
  trendLine: Array<{ totalIncome: number; placementRate: number }>
}
