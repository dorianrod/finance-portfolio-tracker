import type { OverviewPeriod } from '@/domains/portfolio/features/overview/helpers/calculators/buildOverviewComparison/buildOverviewComparison.types'
import type { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'

export function formatOverviewPeriodRange(
  period: OverviewPeriod,
  formatDate: ReturnType<typeof useFormatDate>,
): string {
  const start = formatDate(period.start, {
    style: 'dayMonthYear',
    timeZone: 'UTC',
  })
  const end = formatDate(period.end, { style: 'dayMonthYear', timeZone: 'UTC' })
  return `${start} – ${end}`
}
