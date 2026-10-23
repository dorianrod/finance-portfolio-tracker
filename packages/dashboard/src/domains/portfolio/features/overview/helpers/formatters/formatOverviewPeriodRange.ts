import type { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import type { OverviewPeriod } from '@/domains/portfolio/shared/helpers/calculators/buildOverviewComparison'

export function formatOverviewPeriodRange(
  period: OverviewPeriod,
  formatDate: ReturnType<typeof useFormatDate>,
): string {
  const start = formatDate(`${period.start}T00:00:00Z`, { style: 'dayMonthYear', timeZone: 'UTC' })
  const end = formatDate(`${period.end}T00:00:00Z`, { style: 'dayMonthYear', timeZone: 'UTC' })
  return `${start} – ${end}`
}
