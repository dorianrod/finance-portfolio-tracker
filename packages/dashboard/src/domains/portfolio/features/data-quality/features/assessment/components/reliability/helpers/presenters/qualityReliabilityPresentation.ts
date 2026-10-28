import type { AnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/types/analysisReliabilityTone.type'
import i18n from '@/i18n/i18n'
import type { SWATCH_TONES } from '@/shared/ui/swatchAppearance/swatchTones'
import type { TextTone } from '@/shared/ui/textAppearance/textAppearance.types'

export type QualityTooltipRow = {
  label: string
  value: string
  secondary?: string
  tone: AnalysisReliabilityTone
}

export const RELIABILITY_TONES: Record<
  AnalysisReliabilityTone,
  {
    dot: keyof typeof SWATCH_TONES
    status: TextTone
    value: TextTone
    label: string
  }
> = {
  healthy: {
    dot: 'positive',
    status: 'positive',
    value: 'positive',
    get label() {
      return i18n.t('ui.analysisreliabilitykpi.reliable')
    },
  },
  warning: {
    dot: 'warning',
    status: 'warning',
    value: 'warning',
    get label() {
      return i18n.t('ui.analysisreliabilitykpi.partial')
    },
  },
  critical: {
    dot: 'negative',
    status: 'negative',
    value: 'negative',
    get label() {
      return i18n.t('ui.analysisreliabilitykpi.review')
    },
  },
  unavailable: {
    dot: 'subtle',
    status: 'muted',
    value: 'muted',
    get label() {
      return i18n.t('ui.analysisreliabilitykpi.unavailable')
    },
  },
}
