import type { AnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/analysisReliability/analysisReliability.types'

export function aggregateReliabilityTone(
  tones: AnalysisReliabilityTone[],
): AnalysisReliabilityTone {
  if (tones.every((tone) => tone === 'unavailable')) return 'unavailable'
  if (tones.includes('critical')) return 'critical'
  if (tones.some((tone) => tone === 'warning' || tone === 'unavailable'))
    return 'warning'
  return 'healthy'
}
