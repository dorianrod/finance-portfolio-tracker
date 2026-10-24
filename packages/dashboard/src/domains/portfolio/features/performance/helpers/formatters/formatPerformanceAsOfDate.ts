import i18n from '@/i18n/i18n'
import type { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'

export function formatPerformanceAsOfDate(
  date: Date | undefined,
  formatDate: ReturnType<typeof useFormatDate>,
): string {
  if (!date) return i18n.t('ui.formatperformanceasofdateTs.notAvailable')
  return formatDate(date, { style: 'dayMonthYear', timeZone: 'UTC' })
}
