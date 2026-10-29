import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useFormatFundQualityLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatFundQualityLabel'
import { useFormatFundQualitySourceLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatFundQualitySourceLabel'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function useFormatFundQualityTitle() {
  const { t } = useTranslation()
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
        t('ui.fundqualitybadge.qualityAndSource', {
          quality: formatQualityLabel(status.qualityTier),
          source: formatSourceLabel(status.qualityTier),
        }),
        status.sourceName || t('ui.fundqualitybadge.noSource'),
        t('ui.fundqualitybadge.explainedPercentage', {
          percentage: formatPercentage(status.explainedPct, { unit: ' %' }),
        }),
        date
          ? t('ui.fundqualitybadge.compositionDate', { date })
          : t('ui.fundqualitybadge.unknownCompositionDate'),
        status.issues,
      ]
        .filter(Boolean)
        .join(' · ')
    },
    [t, formatDate, formatPercentage, formatQualityLabel, formatSourceLabel],
  )
}
