import type { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'

export function formatMonthRange(
  months: string[],
  formatDate: ReturnType<typeof useFormatDate>,
): string {
  if (months.length === 0) return ''
  const formatMonth = (month: string) =>
    formatDate(`${month}-01T00:00:00Z`, {
      style: 'shortMonthYear',
      timeZone: 'UTC',
    })
  if (months.length === 1) return formatMonth(months[0])
  return `${formatMonth(months[0])} – ${formatMonth(months[months.length - 1])}`
}
