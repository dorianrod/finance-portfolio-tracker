import type { QualityTheme } from '@/domains/portfolio/features/data-quality/features/assessment/types/qualityTheme.type'

export function makeQualityTheme(
  overrides: Partial<QualityTheme> = {},
): QualityTheme {
  return {
    id: 'pipeline',
    label: 'Portfolio data',
    metric: '0',
    metricLabel: 'errors',
    tone: 'healthy',
    description: '',
    priority: 0,
    ...overrides,
  }
}
