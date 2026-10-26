import { hasMaterialQualityGap } from '@/domains/portfolio/shared/helpers/quality/qualityThresholds/hasMaterialQualityGap'

import type { AnalysisReliabilityTone } from './analysisReliability.types'

export function percentageReliabilityTone(
  percentage: number | null,
): AnalysisReliabilityTone {
  if (percentage == null || !Number.isFinite(percentage)) return 'unavailable'
  const safePercentage = Math.max(0, Math.min(100, percentage))
  if (!hasMaterialQualityGap(100 - safePercentage)) return 'healthy'
  return safePercentage < CRITICAL_RELIABILITY_PCT ? 'critical' : 'warning'
}

const CRITICAL_RELIABILITY_PCT = 80
