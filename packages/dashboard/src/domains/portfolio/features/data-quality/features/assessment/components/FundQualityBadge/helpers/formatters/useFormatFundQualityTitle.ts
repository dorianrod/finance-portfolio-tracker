import { useCallback } from 'react'

import { useFormatFundQualityLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatFundQualityLabel'
import { useFormatFundQualitySourceLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatFundQualitySourceLabel'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function useFormatFundQualityTitle() {
  const formatDate = useFormatDate()
  const formatPercentage = useFormatPercentage()
  const formatQualityLabel = useFormatFundQualityLabel()
  const formatSourceLabel = useFormatFundQualitySourceLabel()
  return useCallback(
    (
      status: FundHoldingStatus | null | undefined,
      { fallback = '—' }: { fallback?: string } = {},
    ): string => {
      if (status == null) return fallback
      const date = formatDate(status.holdingsDate, { fallback: '' })
      return [
        i18n.t('ui.fundqualitybadge.qualityAndSource', {
          quality: formatQualityLabel(status.qualityTier),
          source: formatSourceLabel(status.qualityTier),
        }),
        status.sourceName || i18n.t('ui.fundqualitybadge.noSource'),
        i18n.t('ui.fundqualitybadge.explainedPercentage', {
          percentage: formatPercentage(status.explainedPct, { unit: ' %' }),
        }),
        date
          ? i18n.t('ui.fundqualitybadge.compositionDate', { date })
          : i18n.t('ui.fundqualitybadge.unknownCompositionDate'),
        status.issues,
      ]
        .filter(Boolean)
        .join(' · ')
    },
    [formatDate, formatPercentage, formatQualityLabel, formatSourceLabel],
  )
}
