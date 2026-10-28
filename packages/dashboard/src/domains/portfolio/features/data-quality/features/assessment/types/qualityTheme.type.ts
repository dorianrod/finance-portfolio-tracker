import type {
  QualityThemeId,
  QualityTone,
} from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQuality.type'

export type QualityTheme = {
  id: QualityThemeId
  label: string
  description: string
  metric: string
  metricLabel: string
  tone: QualityTone
  priority: number
}
