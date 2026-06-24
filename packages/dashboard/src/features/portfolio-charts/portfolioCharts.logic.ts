import { fmtEur } from '@/shared/format/money'
import type { AccountTypePoint } from '@/types/history'
import type { PositionRow } from '@/types/domain'
import type { MonthlyOp, MonthlyOpsMap } from '@/hooks/useMonthlyOps'
import type { SavingCapacityPoint } from '@/hooks/useSavingCapacity'

export interface TrailingSavingCapacityPoint extends SavingCapacityPoint {
  rolling_12m: number
  rolling_perf_12m: number
}

// Last 12 months of savings capacity, each enriched with its own trailing
// 12-month rolling sums (computed from the full history, not just the
// truncated slice).
export function computeTrailing12mSavings(savingCapacity: SavingCapacityPoint[]): TrailingSavingCapacityPoint[] {
  return savingCapacity.slice(-12).map((pt, i, arr) => {
    const fullIdx = savingCapacity.length - arr.length + i
    const window = savingCapacity.slice(Math.max(0, fullIdx - 11), fullIdx + 1)
    const rolling_12m = Math.round(window.reduce((sum, p) => sum + p.savings_delta, 0))
    const rolling_perf_12m = Math.round(window.reduce((sum, p) => sum + p.perf_delta, 0))
    return { ...pt, rolling_12m, rolling_perf_12m }
  })
}

export interface TopPerformer {
  label: string
  name: string
  pct: number
  gain: number
  value: number
  account_type: string
}

// Active positions with non-zero unrealized P&L, sorted best to worst.
export function computeTopPerformers(positions?: PositionRow[]): TopPerformer[] {
  if (!positions) return []
  return positions
    .filter((p) => p.status === 'active' && p.unrealized_gain_pct !== null && p.unrealized_gain_pct !== 0)
    .map((p) => ({
      label: p.ticker || p.name.slice(0, 24),
      name: p.name,
      pct: Math.round(p.unrealized_gain_pct! * 10) / 10,
      gain: Math.round(p.unrealized_gain ?? 0),
      value: Math.round(p.total_value ?? 0),
      account_type: p.account_type ?? '',
    }))
    .sort((a, b) => b.pct - a.pct)
}

export interface AccountTypePointWithLabel extends AccountTypePoint {
  _label: string
}

export function buildAccountTypeLabels(accountTypeData?: AccountTypePoint[]): AccountTypePointWithLabel[] {
  return (accountTypeData ?? []).map((pt) => {
    const gainPct = pt.total_cost_basis > 0 ? (pt.unrealized_gain / pt.total_cost_basis) * 100 : 0
    return { ...pt, _label: `${fmtEur(pt.total_value)} ${gainPct >= 0 ? '+' : ''}${gainPct.toFixed(0)}%` }
  })
}

export function filterMonthlyOpsByAccounts(allOps: MonthlyOpsMap, accounts?: Set<string>): MonthlyOpsMap {
  if (!accounts || accounts.size === 0) return allOps
  return new Map<string, MonthlyOp[]>(
    [...allOps.entries()].map(([month, list]) => [
      month,
      list.filter((o) => accounts.has(o.account)),
    ]),
  )
}
