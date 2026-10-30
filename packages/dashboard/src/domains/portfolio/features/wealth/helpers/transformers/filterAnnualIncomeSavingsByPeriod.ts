import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/types/annualIncomeSavingsPoint.type'

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
