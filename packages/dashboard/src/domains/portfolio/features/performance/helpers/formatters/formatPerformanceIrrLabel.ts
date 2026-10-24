import i18n from '@/i18n/i18n'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import type { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function formatPerformanceIrrLabel(
  value: number | null,
  status: IrrStatus,
  formatPercentage: ReturnType<typeof useFormatPercentage>,
): string {
  if (status === 'loading') return i18n.t('ui.formatperformanceirrlabelTs.calculating')
  if (status === 'error') return i18n.t('ui.formatperformanceirrlabelTs.unavailable')
  return value === null ? i18n.t('ui.formatperformanceirrlabelTs.notAvailable') : formatPercentage(value, { decimals: 2, signed: true })
}
