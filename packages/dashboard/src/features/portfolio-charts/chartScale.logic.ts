import type { AccountTypeHistoryPoint } from '@/hooks/useAccountTypeHistory'
import { partitionPercentages } from '@/shared/format/percentage'
import type { PortfolioHistoryPoint } from '@/types/history'

export const PORTFOLIO_COST_SHARE_KEY = '__cost_share'
export const PORTFOLIO_GAIN_SHARE_KEY = '__gain_share'

export function accountTypeShareKey(index: number): string {
  return `__account_type_share_${index}`
}

function signedShare(value: number, total: number): number | null {
  return total === 0 ? null : value / total * 100
}

export function withPortfolioComposition(history: PortfolioHistoryPoint[]) {
  return history.map((point) => {
    const total = point.total_cost_basis + point.unrealized_gain
    return {
      ...point,
      [PORTFOLIO_COST_SHARE_KEY]: signedShare(point.total_cost_basis, total),
      [PORTFOLIO_GAIN_SHARE_KEY]: signedShare(point.unrealized_gain, total),
    }
  })
}

export function withAccountTypeShares(data: AccountTypeHistoryPoint[], accountTypes: string[]) {
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
