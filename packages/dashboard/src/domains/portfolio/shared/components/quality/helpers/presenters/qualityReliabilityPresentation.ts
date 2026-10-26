import type { AnalysisReliabilityTone } from '@/domains/portfolio/shared/helpers/quality/analysisReliability'
import i18n from '@/i18n/i18n'
import type { SWATCH_TONES } from '@/shared/ui/swatchAppearance'
import type { TextTone } from '@/shared/ui/textAppearance'

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
    label: i18n.t('ui.analysisreliabilitykpi.reliable'),
  },
  warning: {
    dot: 'warning',
    status: 'warning',
    value: 'warning',
    label: i18n.t('ui.analysisreliabilitykpi.partial'),
  },
  critical: {
    dot: 'negative',
    status: 'negative',
    value: 'negative',
    label: i18n.t('ui.analysisreliabilitykpi.review'),
  },
  unavailable: {
    dot: 'subtle',
    status: 'muted',
    value: 'muted',
    label: i18n.t('ui.analysisreliabilitykpi.unavailable'),
  },
}
