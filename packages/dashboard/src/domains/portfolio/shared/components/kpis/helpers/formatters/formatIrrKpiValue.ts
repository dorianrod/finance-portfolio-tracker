import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import i18n from '@/i18n/i18n'
import type { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function formatIrrKpiValue(
  value: number | null,
  status: IrrStatus,
  formatPercentage: ReturnType<typeof useFormatPercentage>,
): string {
  if (status === 'loading') return i18n.t('ui.formatirrkpivalueTs.calculating')
  return value == null
    ? '—'
    : formatPercentage(value, { decimals: 2, signed: true })
}
