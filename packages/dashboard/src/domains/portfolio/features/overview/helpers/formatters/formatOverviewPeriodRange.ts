import type { OverviewPeriod } from '@/domains/portfolio/shared/helpers/calculators/buildOverviewComparison'
import type { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'

export function formatOverviewPeriodRange(
  period: OverviewPeriod,
  formatDate: ReturnType<typeof useFormatDate>,
): string {
  const start = formatDate(period.start, { style: 'dayMonthYear', timeZone: 'UTC' })
  const end = formatDate(period.end, { style: 'dayMonthYear', timeZone: 'UTC' })
  return `${start} – ${end}`
}
