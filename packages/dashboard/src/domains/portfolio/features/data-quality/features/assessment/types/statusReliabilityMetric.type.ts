import type { AnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/types/analysisReliabilityTone.type'

export type StatusReliabilityMetric = {
  value: string
  metricLabel: string
  tone: AnalysisReliabilityTone
}
