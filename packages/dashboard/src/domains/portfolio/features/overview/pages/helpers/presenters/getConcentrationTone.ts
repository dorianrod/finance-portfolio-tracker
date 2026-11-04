import type { TextTone } from '@/shared/ui/textAppearance/textAppearance.types'

export function getConcentrationTone(value: number | null): TextTone {
  if (value == null || value === 0) return 'subtle'
  return value < 0 ? 'positive' : 'negative'
}
