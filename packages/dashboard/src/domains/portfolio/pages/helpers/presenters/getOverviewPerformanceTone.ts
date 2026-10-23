import { SEMANTIC_TEXT_CLASSES } from '@/shared/theme/semanticColors'

export function getOverviewPerformanceTone(value: number | null): string {
  if (value == null) return 'text-gray-500'
  return value >= 0
    ? SEMANTIC_TEXT_CLASSES.performancePositive
    : SEMANTIC_TEXT_CLASSES.performanceNegative
}
