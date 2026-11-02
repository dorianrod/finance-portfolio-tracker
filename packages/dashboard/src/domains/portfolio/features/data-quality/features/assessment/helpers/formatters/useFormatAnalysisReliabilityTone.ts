import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { AnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/types/analysisReliabilityTone.type'

export function useFormatAnalysisReliabilityTone() {
  const { t } = useTranslation()
  return useCallback(
    (
      tone: AnalysisReliabilityTone | null | undefined,
      { fallback = '—' }: { fallback?: string } = {},
    ): string => {
      if (tone == null) return fallback
      const labels: Record<AnalysisReliabilityTone, string> = {
        healthy: t('ui.analysisreliabilitykpi.reliable'),
        warning: t('ui.analysisreliabilitykpi.partial'),
        critical: t('ui.analysisreliabilitykpi.review'),
        unavailable: t('ui.analysisreliabilitykpi.unavailable'),
      }
      return labels[tone]
    },
    [t],
  )
}
