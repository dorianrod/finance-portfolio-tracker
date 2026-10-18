import { SEMANTIC_TEXT_CLASSES } from '@/shared/format/semanticColors'

export function gainClass(v: number | null | undefined): string {
  if (v == null) return 'text-gray-400'
  return v >= 0 ? SEMANTIC_TEXT_CLASSES.performancePositive : SEMANTIC_TEXT_CLASSES.performanceNegative
}
