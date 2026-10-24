import type { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'

export function formatPerformanceDateRange(
  summary: { startDate: Date | null; endDate: Date | null },
  formatDate: ReturnType<typeof useFormatDate>,
): string {
  if (!summary.startDate || !summary.endDate) return ''
  const format = (date: Date) =>
    formatDate(date, { style: 'shortMonthYear', timeZone: 'UTC' })
  return `${format(summary.startDate)} – ${format(summary.endDate)}`
}
