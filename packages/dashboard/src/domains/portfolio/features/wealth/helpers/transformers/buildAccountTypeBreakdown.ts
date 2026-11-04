import type { AccountTypePoint } from '@/domains/portfolio/features/wealth/types/accountTypePoint.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function buildAccountTypeBreakdown(
  filtered: PositionRow[],
): AccountTypePoint[] {
  const map = new Map<string, { cost: number; gain: number }>()
  for (const p of filtered) {
    if (p.status !== 'active') continue
    const t = p.account_type ?? 'Other'
    const v = p.total_value ?? 0
    const g = p.unrealized_gain ?? 0
    const c = v - g
    const cur = map.get(t) ?? { cost: 0, gain: 0 }
    map.set(t, { cost: cur.cost + c, gain: cur.gain + g })
  }
  return [...map.entries()]
    .map(([account_type, { cost, gain }]) => ({
      account_type,
      total_cost_basis: Math.round(cost),
      unrealized_gain: Math.round(gain),
      total_value: Math.round(cost + gain),
    }))
    .toSorted((a, b) => b.total_value - a.total_value)
}
