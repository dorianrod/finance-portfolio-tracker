import type { AccountTypeHistoryPoint } from '@/domains/portfolio/features/wealth/types/accountTypeHistory.type'

export type AccountTypeChartPoint = AccountTypeHistoryPoint & {
  total: number
  shares: number[]
}
