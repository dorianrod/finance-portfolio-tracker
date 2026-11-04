import type { AnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/types/analysisReliabilityTone.type'

export type AnalysisReliabilityMetric = {
  // Loading or unavailable analysis has no measured reliability percentage.
  percentage: number | null
  amount: number
  metricLabel: string
  tone: AnalysisReliabilityTone
}
