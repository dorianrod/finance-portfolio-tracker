import { hasMaterialQualityGap } from '@/domains/portfolio/shared/helpers/quality/qualityThresholds'
import i18n from '@/i18n/i18n'

export type AnalysisReliabilityTone = 'healthy' | 'warning' | 'critical' | 'unavailable'

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

const CRITICAL_RELIABILITY_PCT = 80

export function percentageReliabilityTone(percentage: number | null): AnalysisReliabilityTone {
  if (percentage == null || !Number.isFinite(percentage)) return 'unavailable'
  const safePercentage = Math.max(0, Math.min(100, percentage))
  if (!hasMaterialQualityGap(100 - safePercentage)) return 'healthy'
  return safePercentage < CRITICAL_RELIABILITY_PCT ? 'critical' : 'warning'
}

export function aggregateReliabilityTone(
  tones: AnalysisReliabilityTone[],
): AnalysisReliabilityTone {
  if (tones.every((tone) => tone === 'unavailable')) return 'unavailable'
  if (tones.includes('critical')) return 'critical'
  if (tones.some((tone) => tone === 'warning' || tone === 'unavailable')) return 'warning'
  return 'healthy'
}

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

export function pipelineStatusLabel({
  errorCount,
  warningCount,
  loading = false,
}: {
  errorCount: number
  warningCount: number
  loading?: boolean
}): string {
  if (loading) return i18n.t('ui.analysisreliability.loading')
  const issueCount = errorCount + warningCount
  if (issueCount === 0) return i18n.t('ui.analysisreliability.noAnomaly')
  return i18n.t('ui.analysisreliability.anomalyCount', { count: issueCount })
}
