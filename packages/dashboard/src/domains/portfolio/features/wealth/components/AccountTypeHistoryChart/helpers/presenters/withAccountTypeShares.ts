import type { AccountTypeChartPoint } from '@/domains/portfolio/features/wealth/components/AccountTypeHistoryChart/types/accountTypeChartPoint.type'
import type { AccountTypeHistoryPoint } from '@/domains/portfolio/features/wealth/types/accountTypeHistory.type'
import { getOwnValue } from '@/shared/helpers/transformers/getOwnValue'
import { partitionPercentages } from '@/shared/helpers/transformers/partitionPercentages'

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
