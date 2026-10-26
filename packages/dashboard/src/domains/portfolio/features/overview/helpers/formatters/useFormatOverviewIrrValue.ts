import { useCallback } from 'react'

import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import i18n from '@/i18n/i18n'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function useFormatOverviewIrrValue() {
  const formatPercentage = useFormatPercentage()
  return useCallback(
    (status: IrrStatus, value: number | null): string => {
      if (status === 'loading')
        return i18n.t('ui.formatoverviewirrvalueTs.calculating')
      return formatPercentage(status === 'error' ? null : value, {
        decimals: 2,
        signed: true,
      })
    },
    [formatPercentage],
  )
}
