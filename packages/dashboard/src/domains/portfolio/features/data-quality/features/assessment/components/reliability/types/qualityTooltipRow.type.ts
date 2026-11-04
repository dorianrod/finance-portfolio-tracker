import type { AnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/types/analysisReliabilityTone.type'

export type QualityTooltipRow = {
  label: string
  value: string
  secondary?: string
  tone: AnalysisReliabilityTone
}
