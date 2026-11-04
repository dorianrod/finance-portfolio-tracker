import type { AnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/types/analysisReliabilityTone.type'
import type { SWATCH_TONES } from '@/shared/ui/swatchAppearance/swatchTones'
import type { TextTone } from '@/shared/ui/textAppearance/textAppearance.types'

export const RELIABILITY_TONES: Record<
  AnalysisReliabilityTone,
  {
    dot: keyof typeof SWATCH_TONES
    status: TextTone
    value: TextTone
  }
> = {
  healthy: {
    dot: 'positive',
    status: 'positive',
    value: 'positive',
  },
  warning: {
    dot: 'warning',
    status: 'warning',
    value: 'warning',
  },
  critical: {
    dot: 'negative',
    status: 'negative',
    value: 'negative',
  },
  unavailable: {
    dot: 'subtle',
    status: 'muted',
    value: 'muted',
  },
}
