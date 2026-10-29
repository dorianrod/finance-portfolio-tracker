import type { AccountTypeChartPoint } from '@/domains/portfolio/features/wealth/components/AccountTypeHistoryChart/types/accountTypeChartPoint.type'
import type { AccountTypeHistoryPoint } from '@/domains/portfolio/features/wealth/types/accountTypeHistory.type'
import { partitionPercentages } from '@/shared/helpers/calculators/partitionPercentages'
import { getOwnValue } from '@/shared/helpers/selectors/getOwnValue'

export function withAccountTypeShares(
  data: AccountTypeHistoryPoint[],
  accountTypes: string[],
): AccountTypeChartPoint[] {
  return data.map((point) => {
    const values = accountTypes.map(
      (accountType) => getOwnValue(point.values, accountType) ?? 0,
    )
    const shares = partitionPercentages(values)
    return { ...point, shares }
  })
}
