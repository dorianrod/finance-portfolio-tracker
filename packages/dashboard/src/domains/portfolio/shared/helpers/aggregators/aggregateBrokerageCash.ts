import type { CashHistoryPoint } from '@/domains/portfolio/shared/types/cashHistoryPoint.type'

export type RawCashRow = {
  snapshot_date: string
  account: string
  account_type: string
  account_category: string
  cumulative_cash: number
}

// Only brokerage accounts hold real free cash; other categories
// (employer savings, insurance wrappers, retirement…) only ever
// show deposits as positions, never withdrawable cash.
export function aggregateBrokerageCash(rows: RawCashRow[]): CashHistoryPoint[] {
  const byDate = new Map<string, number>()
  for (const row of rows) {
    if (row.account_category !== 'brokerage') continue
    byDate.set(row.snapshot_date, (byDate.get(row.snapshot_date) ?? 0) + row.cumulative_cash)
  }
  return [...byDate.entries()]
    .map(([date, total_broker_cash]) => ({ date, total_broker_cash }))
    .toSorted((a, b) => a.date.localeCompare(b.date))
}
