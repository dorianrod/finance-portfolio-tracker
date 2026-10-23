import i18n from '@/i18n/i18n'
import type { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { formatPerformanceAsOfDate } from './formatPerformanceAsOfDate'

export function formatExactPerformanceDateRange(
  summary: { startDate: string | null; endDate: string | null },
  formatDate: ReturnType<typeof useFormatDate>,
): string {
  if (!summary.startDate || !summary.endDate) return i18n.t('ui.formatexactperformancedaterangeTs.notAvailable')
  return `${formatPerformanceAsOfDate(summary.startDate, formatDate)} – ${formatPerformanceAsOfDate(summary.endDate, formatDate)}`
}
