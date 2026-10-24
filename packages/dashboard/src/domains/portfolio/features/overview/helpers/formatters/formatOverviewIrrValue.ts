import i18n from '@/i18n/i18n'
import type { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'

export function formatOverviewIrrValue(
  status: IrrStatus,
  value: number | null,
  formatPercentage: ReturnType<typeof useFormatPercentage>,
): string {
  if (status === 'loading') return i18n.t('ui.formatoverviewirrvalueTs.calculating')
  if (status === 'error' || value == null) return '—'
  return formatPercentage(value, { decimals: 2, signed: true })
}
