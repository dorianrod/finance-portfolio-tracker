import { SEMANTIC_TEXT_CLASSES } from '@/shared/theme/semanticColors'

export function getConcentrationTone(value: number | null): string {
  if (value == null || value === 0) return 'text-content-subtle'
  return value < 0
    ? SEMANTIC_TEXT_CLASSES.performancePositive
    : SEMANTIC_TEXT_CLASSES.performanceNegative
}
