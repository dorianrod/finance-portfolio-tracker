import { SEMANTIC_TEXT_CLASSES } from '@/shared/theme/semanticColors'

export function gainClass(v: number | null | undefined): string {
  if (v == null) return 'text-content-muted'
  return v >= 0
    ? SEMANTIC_TEXT_CLASSES.performancePositive
    : SEMANTIC_TEXT_CLASSES.performanceNegative
}
