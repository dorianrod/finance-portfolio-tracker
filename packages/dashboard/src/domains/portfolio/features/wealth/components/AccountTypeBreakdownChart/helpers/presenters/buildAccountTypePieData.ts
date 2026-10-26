import type { AccountTypePoint } from '@/domains/portfolio/features/wealth/types/accountTypePoint.type'

export function buildAccountTypePieData(data: AccountTypePoint[]) {
  return data
    .map((point) => ({
      ...point,
      total_cost_basis: Math.max(0, point.total_cost_basis),
    }))
    .filter((point) => point.total_value > 0)
}
