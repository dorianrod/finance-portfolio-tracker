import type { AccountTypeHistoryPoint } from '@/domains/portfolio/features/wealth/types/accountTypeHistory.type'
import { getOwnValue } from '@/shared/helpers/transformers/getOwnValue'

export function withAccountTypeHistoryTotals(
  data: readonly AccountTypeHistoryPoint[],
  accountTypes: readonly string[],
) {
  return data.map((point) => ({
    ...point,
    total: accountTypes.reduce(
      (sum, accountType) => sum + (getOwnValue(point.values, accountType) ?? 0),
      0,
    ),
  }))
}
