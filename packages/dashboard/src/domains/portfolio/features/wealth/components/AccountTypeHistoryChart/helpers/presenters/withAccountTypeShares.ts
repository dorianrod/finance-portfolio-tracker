import type { AccountTypeChartPoint } from '@/domains/portfolio/features/wealth/components/AccountTypeHistoryChart/types/accountTypeChartPoint.type'
import type { AccountTypeHistoryPoint } from '@/domains/portfolio/features/wealth/types/accountTypeHistory.type'
import { partitionPercentages } from '@/shared/helpers/calculators/partitionPercentages'

export function withAccountTypeShares(
  data: AccountTypeHistoryPoint[],
  accountTypes: string[],
): AccountTypeChartPoint[] {
  return data.map((point) => {
    const values = accountTypes.map(
      (accountType) => point.values[accountType] ?? 0,
    )
    const shares = partitionPercentages(values)
    return { ...point, shares }
  })
}
