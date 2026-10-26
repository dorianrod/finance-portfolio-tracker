import type { AnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/analysisReliability/analysisReliability.types'
import { hasMaterialQualityGap } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/qualityThresholds/hasMaterialQualityGap'

export function percentageReliabilityTone(
  percentage: number | null,
): AnalysisReliabilityTone {
  if (percentage == null || !Number.isFinite(percentage)) return 'unavailable'
  const safePercentage = Math.max(0, Math.min(100, percentage))
  if (!hasMaterialQualityGap(100 - safePercentage)) return 'healthy'
  return safePercentage < CRITICAL_RELIABILITY_PCT ? 'critical' : 'warning'
}

const CRITICAL_RELIABILITY_PCT = 80
