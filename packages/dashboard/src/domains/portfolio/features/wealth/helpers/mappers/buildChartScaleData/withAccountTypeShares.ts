import type { AccountTypeHistoryPoint } from '@/domains/portfolio/features/wealth/helpers/aggregators/buildAccountTypeHistory'
import { partitionPercentages } from '@/shared/helpers/calculators/partitionPercentages'

import { accountTypeShareKey } from './accountTypeShareKey'

export function withAccountTypeShares(
  data: AccountTypeHistoryPoint[],
  accountTypes: string[],
) {
  return data.map((point) => {
    const values = accountTypes.map((accountType) => {
      const value = point[accountType]
      return typeof value === 'number' ? value : 0
    })
    const shares = partitionPercentages(values)
    const result: AccountTypeHistoryPoint = { ...point }
    accountTypes.forEach((_accountType, index) => {
      result[accountTypeShareKey(index)] = shares[index]
    })
    return result
  })
}
