import type { ManualPriceOverride } from '@/domains/portfolio/apis/queries/useManualPriceOverrides'
import type { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'

export function formatManualPrice(
  row: ManualPriceOverride,
  formatMoney: ReturnType<typeof useFormatMoney>,
): string {
  const price = Number(row.price)
  if (!Number.isFinite(price)) return `${row.price} ${row.currency}`.trim()
  try {
    return formatMoney(price, {
      currency: row.currency || 'EUR',
      maximumFractionDigits: 4,
    })
  } catch {
    return `${row.price} ${row.currency}`.trim()
  }
}
