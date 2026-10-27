import type { HistoryPoint } from '@/domains/portfolio/features/holdings/features/positions/types/historyPoint.type'

export function hasUnitPriceHistory(
  history: HistoryPoint[] | null | undefined,
) {
  return (
    history?.some((point) => Math.abs(point.last_price - point.value) > 0.01) ??
    false
  )
}
