import type { IrrStatus } from '@/domains/portfolio/types/history'
import type { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function formatPerformanceIrrLabel(
  value: number | null,
  status: IrrStatus,
  formatPercentage: ReturnType<typeof useFormatPercentage>,
): string {
  if (status === 'loading') return 'Calculating…'
  if (status === 'error') return 'Unavailable'
  return value === null ? 'Not available' : formatPercentage(value, { decimals: 2, signed: true })
}
