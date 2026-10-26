import type { QualityTone } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQuality.type'
import type { SWATCH_TONES } from '@/shared/ui/swatchAppearance/swatchTones'

export const QUALITY_TONES: Record<QualityTone, keyof typeof SWATCH_TONES> = {
  healthy: 'positive',
  warning: 'warning',
  critical: 'negative',
  unavailable: 'subtle',
}
