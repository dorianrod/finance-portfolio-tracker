import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { RollingReturn } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/transformers/buildHoverChartData/buildHoverChartData.types'

export function useFormatRollingReturnPeriod() {
  const { t } = useTranslation()
  return useCallback(
    (
      period: RollingReturn['period'] | null | undefined,
      { fallback = '—' }: { fallback?: string } = {},
    ): string => {
      if (period == null) return fallback
      const labels: Record<RollingReturn['period'], string> = {
        'six-months': t('ui.rollingunitpriceperf.sixMonths'),
        'one-year': t('ui.rollingunitpriceperf.oneYear'),
        'since-start': t('ui.buildhoverchartdataTs.sinceStart'),
      }
      return labels[period]
    },
    [t],
  )
}
