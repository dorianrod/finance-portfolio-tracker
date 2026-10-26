import type { AnalysisReliabilityTone } from './analysisReliability.types'

export function pipelineReliabilityTone({
  errorCount,
  warningCount,
  loading = false,
}: {
  errorCount: number
  warningCount: number
  loading?: boolean
}): AnalysisReliabilityTone {
  if (loading) return 'unavailable'
  if (errorCount > 0) return 'critical'
  if (warningCount > 0) return 'warning'
  return 'healthy'
}
