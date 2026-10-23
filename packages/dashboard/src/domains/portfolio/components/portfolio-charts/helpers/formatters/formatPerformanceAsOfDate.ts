import type { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'

export function formatPerformanceAsOfDate(
  date: string | undefined,
  formatDate: ReturnType<typeof useFormatDate>,
): string {
  if (!date) return 'Not available'
  return formatDate(`${date.slice(0, 10)}T00:00:00Z`, { style: 'dayMonthYear', timeZone: 'UTC' })
}
