// eslint-disable-next-line local/review-shared-feature-sharing -- The shell supplies this validated, scoped history to overview comparisons, wealth analysis and performance. See SHARED_OWNERSHIP_AUDIT.md.
import { accountFilterId } from '@/domains/portfolio/shared/helpers/filters/accountFilter/accountFilterId'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import type { RawPositionRow } from '@/domains/portfolio/shared/types/rawPosition.type'

// When an account filter is active, the portfolio-wide history series is
// replaced with one rebuilt from raw per-account position snapshots
// restricted to the selected accounts.
// eslint-disable-next-line complexity -- Selected-account values and cost basis reconstruct one fallback history series with explicitly unavailable IRR.
export function applyAccountFilterToHistory(
  allPositionRows: RawPositionRow[],
  enrichedHistory: PortfolioHistoryPoint[],
  accounts: Set<string>,
): PortfolioHistoryPoint[] {
  if (accounts.size === 0) return enrichedHistory

  const byDate = new Map<number, { tv: number; cb: number; ug: number }>()
  for (const p of allPositionRows) {
    if (!accounts.has(accountFilterId(p))) continue
    const tv = p.total_value ?? 0
    const cb = (p.quantity ?? 0) * (p.avg_buy_price ?? 0)
    const ug = p.unrealized_gain ?? 0
    const cur = byDate.get(p.snapshot_date.getTime()) ?? { tv: 0, cb: 0, ug: 0 }
    byDate.set(p.snapshot_date.getTime(), {
      tv: cur.tv + tv,
      cb: cur.cb + cb,
      ug: cur.ug + ug,
    })
  }

  return [...byDate.entries()]
    .toSorted(([a], [b]) => a - b)
    .map(([date, { tv, cb, ug }]) => ({
      date: new Date(date),
      total_value: tv,
      total_cost_basis: Math.round(cb),
      unrealized_gain: Math.round(ug),
      net_cash_injected: 0,
      cash_delta: null,
      tri: null,
      tri_rolling_1y: null,
      tri_rolling_3y: null,
      total_broker_cash: 0,
    }))
}
