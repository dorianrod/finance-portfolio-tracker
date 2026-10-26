import { useCallback } from 'react'

import type { ManualPriceOverride } from '@/domains/portfolio/features/data-quality/shared/types/manualPriceOverride.type'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'

export function useFormatManualPrice() {
  const formatMoney = useFormatMoney()
  return useCallback(
    (row: ManualPriceOverride): string =>
      formatMoney(row.price, {
        currency: row.currency,
        maximumFractionDigits: 4,
      }),
    [formatMoney],
  )
}
