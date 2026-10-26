import type { ManualPriceOverride } from '@/domains/portfolio/features/data-quality/shared/types/manualPriceOverride.type'
import type { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'

export function formatManualPrice(
  row: ManualPriceOverride,
  formatMoney: ReturnType<typeof useFormatMoney>,
): string {
  return formatMoney(row.price, {
    currency: row.currency,
    maximumFractionDigits: 4,
  })
}
