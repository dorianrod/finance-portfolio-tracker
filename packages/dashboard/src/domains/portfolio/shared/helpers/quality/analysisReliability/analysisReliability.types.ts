export type AnalysisReliabilityTone =
  'healthy' | 'warning' | 'critical' | 'unavailable'

export type AnalysisReliabilityMetric = {
  percentage: number | null
  amount: number
  metricLabel: string
  tone: AnalysisReliabilityTone
}

export type StatusReliabilityMetric = {
  value: string
  metricLabel: string
  tone: AnalysisReliabilityTone
}
