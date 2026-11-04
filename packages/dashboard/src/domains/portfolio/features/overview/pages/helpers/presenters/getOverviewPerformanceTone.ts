import type { TextTone } from '@/shared/ui/textAppearance/textAppearance.types'

export function getOverviewPerformanceTone(value: number | null): TextTone {
  if (value == null) return 'subtle'
  return value >= 0 ? 'positive' : 'negative'
}
