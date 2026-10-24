import type { AnalysisReliabilityTone } from '@/domains/portfolio/shared/helpers/quality/analysisReliability'
import i18n from '@/i18n/i18n'

export type QualityTooltipRow = {
  label: string
  value: string
  secondary?: string
  tone: AnalysisReliabilityTone
}

export const RELIABILITY_TONES: Record<
  AnalysisReliabilityTone,
  {
    dot: string
    status: string
    value: string
    label: string
  }
> = {
  healthy: {
    dot: 'bg-positive',
    status: 'text-positive',
    value: 'text-positive',
    label: i18n.t('ui.analysisreliabilitykpi.reliable'),
  },
  warning: {
    dot: 'bg-warning',
    status: 'text-warning',
    value: 'text-warning',
    label: i18n.t('ui.analysisreliabilitykpi.partial'),
  },
  critical: {
    dot: 'bg-danger',
    status: 'text-danger',
    value: 'text-danger',
    label: i18n.t('ui.analysisreliabilitykpi.review'),
  },
  unavailable: {
    dot: 'bg-content-subtle',
    status: 'text-content-muted',
    value: 'text-content-muted',
    label: i18n.t('ui.analysisreliabilitykpi.unavailable'),
  },
}
