import type { TextTone } from '@/shared/ui/textAppearance/textAppearance.types'

export function getGainTone(value: number | null | undefined): TextTone {
  if (value == null) return 'muted'
  return value >= 0 ? 'positive' : 'negative'
}
