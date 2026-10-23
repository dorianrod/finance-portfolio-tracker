import type { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import type { IrrStatus } from '@/domains/portfolio/types/history'

export function formatIrrKpiValue(
  value: number | null,
  status: IrrStatus,
  formatPercentage: ReturnType<typeof useFormatPercentage>,
): string {
  if (status === 'loading') return 'Calculating…'
  return value == null ? '—' : formatPercentage(value, { decimals: 2, signed: true })
}
