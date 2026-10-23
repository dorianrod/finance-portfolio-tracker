import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/helpers/mappers/mapAnnualIncomeSavings'

export function getIncomeYearOpacity(point: AnnualIncomeSavingsPoint): number {
  return point.incomeStatus === 'forecast' ? 0.45 : 1
}
