import type { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'

export function formatPerformanceDateRange(
  summary: { startDate: string | null; endDate: string | null },
  formatDate: ReturnType<typeof useFormatDate>,
): string {
  if (!summary.startDate || !summary.endDate) return ''
  const format = (date: string) => formatDate(`${date}T00:00:00Z`, { style: 'shortMonthYear', timeZone: 'UTC' })
  return `${format(summary.startDate)} – ${format(summary.endDate)}`
}
