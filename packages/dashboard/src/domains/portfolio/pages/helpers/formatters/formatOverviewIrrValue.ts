import type { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import type { IrrStatus } from '@/domains/portfolio/types/history'

export function formatOverviewIrrValue(
  status: IrrStatus,
  value: number | null,
  formatPercentage: ReturnType<typeof useFormatPercentage>,
): string {
  if (status === 'loading') return 'Calculating…'
  if (status === 'error' || value == null) return '—'
  return formatPercentage(value, { decimals: 2, signed: true })
}
