import type { TextTone } from '@/shared/ui/textAppearance/textAppearance.types'

export function getPerformanceTone(value: number | null): TextTone {
  return value == null || value >= 0 ? 'positive' : 'negative'
}
