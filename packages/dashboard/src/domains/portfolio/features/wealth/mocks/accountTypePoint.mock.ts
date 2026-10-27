import type { AccountTypePoint } from '@/domains/portfolio/features/wealth/types/accountTypePoint.type'

export function createAccountTypePoint(gain: number): AccountTypePoint {
  return {
    account_type: 'Brokerage',
    total_cost_basis: 100,
    unrealized_gain: gain,
    total_value: 100 + gain,
  }
}
