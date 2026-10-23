import { SEMANTIC_TEXT_CLASSES } from '@/shared/theme/semanticColors'

export function getPerformanceColor(value: number | null): string {
  return value == null || value >= 0
    ? SEMANTIC_TEXT_CLASSES.performancePositive
    : SEMANTIC_TEXT_CLASSES.performanceNegative
}
