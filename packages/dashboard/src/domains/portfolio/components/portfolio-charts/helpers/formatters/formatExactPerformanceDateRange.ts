import type { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { formatPerformanceAsOfDate } from './formatPerformanceAsOfDate'

export function formatExactPerformanceDateRange(
  summary: { startDate: string | null; endDate: string | null },
  formatDate: ReturnType<typeof useFormatDate>,
): string {
  if (!summary.startDate || !summary.endDate) return 'Not available'
  return `${formatPerformanceAsOfDate(summary.startDate, formatDate)} – ${formatPerformanceAsOfDate(summary.endDate, formatDate)}`
}
