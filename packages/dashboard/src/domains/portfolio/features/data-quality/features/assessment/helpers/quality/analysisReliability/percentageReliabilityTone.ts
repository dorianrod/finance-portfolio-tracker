import { hasMaterialQualityGap } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/businessRules/hasMaterialQualityGap'
import type { AnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/types/analysisReliabilityTone.type'

export function percentageReliabilityTone(
  percentage: number | null,
): AnalysisReliabilityTone {
  if (percentage == null || !Number.isFinite(percentage)) return 'unavailable'
  const safePercentage = Math.max(0, Math.min(100, percentage))
  if (!hasMaterialQualityGap(100 - safePercentage)) return 'healthy'
  return safePercentage < CRITICAL_RELIABILITY_PCT ? 'critical' : 'warning'
}

const CRITICAL_RELIABILITY_PCT = 80
