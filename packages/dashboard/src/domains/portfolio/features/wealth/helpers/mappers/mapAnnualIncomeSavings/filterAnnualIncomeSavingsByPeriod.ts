import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/helpers/mappers/mapAnnualIncomeSavings/mapAnnualIncomeSavings.types'

export function filterAnnualIncomeSavingsByPeriod(
  points: AnnualIncomeSavingsPoint[],
  dateFrom?: Date,
  dateTo?: Date,
): AnnualIncomeSavingsPoint[] {
  const fromYear = dateFrom?.getUTCFullYear()
  const toYear = dateTo?.getUTCFullYear()
  return points.filter(
    (point) =>
      (fromYear == null || point.year >= fromYear) &&
      (toYear == null || point.year <= toYear),
  )
}
