import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/helpers/mappers/mapAnnualIncomeSavings/mapAnnualIncomeSavings.types'

export function filterAnnualIncomeSavingsByPeriod(
  points: AnnualIncomeSavingsPoint[],
  dateFrom?: Date,
  dateTo?: Date,
): AnnualIncomeSavingsPoint[] {
  const fromYear = dateFrom ? Number(String(dateFrom.getUTCFullYear())) : null
  const toYear = dateTo ? Number(String(dateTo.getUTCFullYear())) : null
  return points.filter(
    (point) =>
      (fromYear == null || point.year >= fromYear) &&
      (toYear == null || point.year <= toYear),
  )
}
