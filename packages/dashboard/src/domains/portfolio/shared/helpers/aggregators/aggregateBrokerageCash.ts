// eslint-disable-next-line local/review-shared-feature-sharing -- Cash-enriched history feeds wealth analysis, performance and overview comparisons through useDashboardHistory. See SHARED_OWNERSHIP_AUDIT.md.
import type { CashHistoryPoint } from '@/domains/portfolio/shared/types/cashHistoryPoint.type'

// Only brokerage accounts hold real free cash; other categories
// (employer savings, insurance wrappers, retirement…) only ever
// show deposits as positions, never withdrawable cash.
export function aggregateBrokerageCash(rows: RawCashRow[]): CashHistoryPoint[] {
  const byDate = new Map<number, number>()
  for (const row of rows) {
    if (row.account_category !== 'brokerage') continue
    byDate.set(
      row.snapshot_date.getTime(),
      (byDate.get(row.snapshot_date.getTime()) ?? 0) + row.cumulative_cash,
    )
  }
  return [...byDate.entries()]
    .map(([date, total_broker_cash]) => ({
      date: new Date(date),
      total_broker_cash,
    }))
    .toSorted((a, b) => a.date.getTime() - b.date.getTime())
}

export type RawCashRow = {
  snapshot_date: Date
  account: string
  account_type: string
  account_category: string
  cumulative_cash: number
}
