import type { AnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/types/analysisReliabilityTone.type'
import type { PipelineIssueStatus } from '@/domains/portfolio/features/data-quality/features/assessment/types/pipelineIssueStatus.type'

export function pipelineReliabilityTone({
  errorCount,
  warningCount,
  loading = false,
}: PipelineIssueStatus): AnalysisReliabilityTone {
  if (loading) return 'unavailable'
  if (errorCount > 0) return 'critical'
  if (warningCount > 0) return 'warning'
  return 'healthy'
}
